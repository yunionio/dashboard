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

export {
  getPdf,
}
