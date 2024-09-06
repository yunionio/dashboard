import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

/*
 * @params {Object} options { target: <domID>, title: <pdf name>}
 */
async function getPdf (options) {
  // eslint-disable-next-line
  return new Promise(async (resolve, reject) => {
    const dom = document.querySelector(options.target)
    const canvas = await html2canvas(dom, { allowTaint: true })
    const contentWidth = canvas.width
    const contentHeight = canvas.height
    const pageWidth = 841.89
    const pageHeight = 595.28
    const pagePadding = 20
    let imgWidth = pageWidth - pagePadding * 2
    let imgHeight = imgWidth / contentWidth * contentHeight
    const pageData = canvas.toDataURL('image/jpeg', 1)
    const PDF = new JsPDF('l', 'pt', 'a4')
    if (imgHeight < pageHeight - pagePadding * 2) {
      PDF.addImage(pageData, 'JPEG', pagePadding, pagePadding, imgWidth, imgHeight)
    } else {
      imgHeight = pageHeight - pagePadding * 2
      imgWidth = imgHeight / contentHeight * contentWidth
      PDF.addImage(pageData, 'JPEG', (contentWidth - imgWidth) / 2, pagePadding, imgWidth, imgHeight)
    }
    PDF.save((options.title || 'echart') + '.pdf')
    resolve(true)
  })
}

/**
 * 获取echart图，tooltip位置，以免超出可展示区域被隐藏
 * @param {Array} point [x, y]
 * @param {Dom} dom tooltip dom
 * @param {Object} size { contentSize: [width, height], viewSize: [width, height] }
 * @param {Boolean} inSidePage 是否在Sidepage页面内
 * @returns {Object} { left, top }
 */
function getChartTooltipPosition (point, dom, size, inSidePage) {
  const { contentSize, viewSize } = size
  const echartY = dom.parentNode.getBoundingClientRect().y
  let canShowTopLine = 0
  let top = -echartY
  if (inSidePage) {
    const sidePageHeaderDom = document.getElementById('side-page-header')
    if (sidePageHeaderDom) {
      canShowTopLine = sidePageHeaderDom.getBoundingClientRect().bottom
      top = -(echartY - canShowTopLine)
    } else {
      const sidePageContentDom = document.getElementById('side-page-container')
      if (sidePageContentDom) {
        canShowTopLine = sidePageContentDom.getBoundingClientRect().y
        top = -(echartY - canShowTopLine)
      }
    }
  }
  return {
    left: point[0] + 20 + contentSize[0] < viewSize[0] ? point[0] + 20 : point[0] - (contentSize[0] + 20),
    top: point[1] - 50 + echartY - contentSize[1] < canShowTopLine ? top : -(contentSize[1] - (point[1] - 50)),
  }
}

/**
 * 调整hex颜色亮度
 * @param {String} hex 颜色值, #fff000, #ccc
 * @param {Number} lum 亮度值, 0-1 变亮，-1-0 变暗
 * @return {String} hex 颜色值
 */
function colorLuminance (hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '')
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  lum = lum || 0
  // convert to decimal and change luminosity
  let rgb = '#'
  let c
  let i
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16)
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
    rgb += ('00' + c).substr(c.length)
  }
  return rgb
}

export {
  getPdf,
  getChartTooltipPosition,
  colorLuminance,
}
