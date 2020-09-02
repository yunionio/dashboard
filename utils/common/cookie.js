import Cookies from 'js-cookie'

export function setLanguage (val) {
  return Cookies.set('lang', val, { expires: 365 })
}

export function getLanguage () {
  let lang = Cookies.get('lang')
  if (lang) return lang
  lang = navigator.language
  setLanguage(lang)
  return lang
}
