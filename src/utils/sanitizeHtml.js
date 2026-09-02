import DOMPurify from 'dompurify'
import marked from 'marked'

/**
 * 消毒 HTML（DOMPurify），供 v-html/innerHTML 出口使用
 * @param {String} html 待消毒的 HTML 字符串
 * @returns {String} 消毒后的 HTML；空值原样返回
 */
export const sanitizeHtml = (html) => {
  if (html == null || html === '') return html || ''
  return DOMPurify.sanitize(String(html))
}

/**
 * markdown 渲染 + 消毒：marked 1.x 不内置 sanitize，输出必须经 DOMPurify 消毒
 * @param {String} text markdown 文本
 * @returns {String} 消毒后的 HTML
 */
export const renderMarkdownSafe = (text) => {
  if (!text || text === '-') return text || '-'
  return sanitizeHtml(marked(text))
}
