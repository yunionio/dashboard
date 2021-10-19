import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

/*
 * @params {Object} options { target: <domID>, title: <pdf name>}
 */
function getPdf (options) {
  const dom = document.querySelector(options.target)
  html2canvas(dom, {
    allowTaint: true,
  }).then(function (canvas) {
    const contentWidth = canvas.width
    const contentHeight = canvas.height
    let imgWidth = 595.28
    let imgHeight = imgWidth / contentWidth * contentHeight
    const pageData = canvas.toDataURL('image/jpeg', 1)
    const PDF = new JsPDF('', 'pt', 'a4')
    if (imgHeight < 841.89) {
      PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
    } else {
      imgHeight = 841.89
      imgWidth = imgHeight / contentHeight * contentWidth
      PDF.addImage(pageData, 'JPEG', (contentWidth - imgWidth) / 2, 0, imgWidth, imgHeight)
    }
    PDF.save((options.title || 'echart') + '.pdf')
  })
}

export {
  getPdf,
}
