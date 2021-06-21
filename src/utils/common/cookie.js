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

export function setLoginDomain (val) {
  if (val) {
    return Cookies.set('login_domain', val, { expires: 365 })
  } else {
    return Cookies.remove('login_domain')
  }
}

export function getLoginDomain () {
  return Cookies.get('login_domain')
}

// 替换指定传入参数的值,paramName为参数,replaceWith为新值
function replaceParamVal (paramName, replaceWith) {
  var oUrl = window.location.href.toString()
  // eslint-disable-next-line no-eval
  var re = eval('/(' + paramName + '=)([^&]*)/gi')
  var nUrl = oUrl.replace(re, paramName + '=' + replaceWith)
  window.location.href = nUrl
}

function getQueryVariable (name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  const result = window.location.search.substr(1).match(reg)
  if (result != null) {
    return decodeURI(result[2])
  } else {
    return null
  }
}

export function setCookieVal (key = 'currency', val, expires = 365) {
  if (!val) return
  getQueryVariable(key) && replaceParamVal(key, val)
  return Cookies.set(key, val, { expires: 365 })
}

export function getCurrency () {
  const currency = getQueryVariable('currency') || Cookies.get('currency') || 'CNY'
  return currency
}

export function getExchangeRateAvailable () {
  const exchangeRateAvailable = getQueryVariable('exchangeRateAvailable') || Cookies.get('exchangeRateAvailable') || true
  return exchangeRateAvailable
}
