import Cookies from 'js-cookie'

export function setLanguage (val) {
  return Cookies.set('language', val, { expires: 365 })
}

export function getLanguage () {
  return Cookies.get('language') || 'zh-CN'
}
