import Vue from 'vue'
import VueI18n from 'vue-i18n'
import * as R from 'ramda'
import vxeTableCN from 'vxe-table/lib/locale/lang/zh-CN'
import vxeTableEN from 'vxe-table/lib/locale/lang/en-US'
import vxeTableJP from 'vxe-table/lib/locale/lang/ja-JP'
import setting from '@/config/setting'
import { getLanguage } from '@/utils/common/cookie'
import en from './en'
import zhCN from './zh-CN'
import jaJP from './ja-JP'
import helpEN from './help-en'
import helpZhCN from './help-zh-CN'
import helpJaJP from './help-ja-JP'

Vue.use(VueI18n)

const messages = {
  en: Object.assign(en, helpEN, vxeTableEN, { brand: setting.brand.en }),
  'zh-CN': Object.assign(zhCN, helpZhCN, vxeTableCN, { brand: setting.brand['zh-CN'] }),
  'ja-JP': Object.assign(jaJP, helpJaJP, vxeTableJP, { brand: setting.brand['ja-JP'] }),
}

const moduleCtx = require.context('../../containers', true, /^((?![\\/]node_modules).)*.\/locales\/.*(json)$/)
const scopeCtx = require.context('../..', true, /^((?![\\/]node_modules).)*.\/scope\/locales\/.*(json)/)

const register = (ctx) => {
  const keys = ctx.keys()
  for (let i = 0, len = keys.length; i < len; i++) {
    const lang = keys[i].match(/([^\\/]+)(?=\.\w+$)/)[0]
    const msg = ctx(keys[i])
    messages[lang] = Object.assign(messages[lang], msg)
  }
}

register(moduleCtx)
register(scopeCtx)

const i18n = new VueI18n({
  locale: getLanguage(),
  messages,
  fallbackLocale: 'en',
  // silentTranslationWarn: true,
})

i18n.getI18n = (key, defaultValue) => {
  const keys = R.is(Array, key) ? key : [key]
  let value = defaultValue === undefined ? keys[0] : defaultValue
  for (let i = 0; i < keys.length; i++) {
    if (i18n.te(keys[i])) {
      value = i18n.t(keys[i])
      return value
    }
  }
  return value
}

i18n.setOriginDictionary = () => {
  if (!i18n.te('originDictionary.agent')) {
    i18n.mergeLocaleMessage('en', {
      originDictionary: R.clone(en.dictionary),
    })
    i18n.mergeLocaleMessage('zh-CN', {
      originDictionary: R.clone(zhCN.dictionary),
    })
    i18n.mergeLocaleMessage('ja-JP', {
      originDictionary: R.clone(jaJP.dictionary),
    })
  }
}

i18n.getOriginDictionaryI18n = (key, defaultValue) => {
  const l = getLanguage()
  let f = {}
  if (l === 'en') {
    f = R.clone(en.dictionary)
  } else if (l === 'zh-CN') {
    f = R.clone(zhCN.dictionary)
  } else if (l === 'ja-JP') {
    f = R.clone(jaJP.dictionary)
  }
  return f[key] || defaultValue
}

/**
 * 替换字符串中的 字典值或其他引用值 为多语言内容
 * @param {string} str
 * @returns {string}
 */
function replaceI18nPlaceholders (str) {
  if (typeof str !== 'string') return str
  return str.replace(/@:([a-zA-Z0-9_.]+)/g, (match, key) => {
    return i18n.t(key)
  })
}

function deepReplaceI18n (obj) {
  if (typeof obj === 'string') {
    return replaceI18nPlaceholders(obj)
  } else if (Array.isArray(obj)) {
    return obj.map(deepReplaceI18n)
  } else if (typeof obj === 'object' && obj !== null) {
    const res = {}
    for (const key in obj) {
      res[key] = deepReplaceI18n(obj[key])
    }
    return res
  }
  return obj
}

i18n.deepReplaceDictionary = () => {
  const l = getLanguage()
  if (l === 'en') {
    deepReplaceI18n(messages.en)
  } else if (l === 'zh-CN') {
    deepReplaceI18n(messages['zh-CN'])
  } else if (l === 'ja-JP') {
    deepReplaceI18n(messages['ja-JP'])
  }
  i18n.setLocaleMessage(l, messages[l])
}

export default i18n
