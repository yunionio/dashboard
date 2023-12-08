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
    const sidePageContentDom = document.getElementById('side-page-container')
    if (sidePageContentDom) {
      canShowTopLine = sidePageContentDom.getBoundingClientRect().y
      top = -(echartY - canShowTopLine)
    }
  }
  return {
    left: point[0] + 20 + contentSize[0] < viewSize[0] ? point[0] + 20 : point[0] - (contentSize[0] + 20),
    top: point[1] - 50 + echartY - contentSize[1] < canShowTopLine ? top : -(contentSize[1] - (point[1] - 50)),
  }
}

export {
  getPdf,
  getChartTooltipPosition,
}
