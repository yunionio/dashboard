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
    let imgWidth = 841.89
    let imgHeight = imgWidth / contentWidth * contentHeight
    const pageData = canvas.toDataURL('image/jpeg', 1)
    const PDF = new JsPDF('l', 'pt', 'a4')
    if (imgHeight < 595.28) {
      PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
    } else {
      imgHeight = 595.28
      imgWidth = imgHeight / contentHeight * contentWidth
      PDF.addImage(pageData, 'JPEG', (contentWidth - imgWidth) / 2, 0, imgWidth, imgHeight)
    }
    PDF.save((options.title || 'echart') + '.pdf')
    resolve(true)
  })
}

export {
  getPdf,
}
