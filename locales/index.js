import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from './en'
import zhCN from './zh-CN'
import helpEN from './help-en'
import helpZhCN from './help-zh-CN'

Vue.use(VueI18n)

const messages = {
  'en': Object.assign(en, helpEN),
  'zh-CN': Object.assign(zhCN, helpZhCN),
}

const containerLocales = require.context('../../containers', true, /^((?![\\/]node_modules).)*.\/locales\/.*(json)$/)
const scopeLocales = require.context('../..', true, /.\/scope\/locales\/.*(json)/)

const registerLocales = (locales) => {
  const keys = locales.keys()
  for (let i = 0, len = keys.length; i < len; i++) {
    const module = (keys[i].match(/\/(.+?)\//)[1]).toUpperCase()
    const locale = keys[i].match(/([^\\/]+)(?=\.\w+$)/)[0]
    const localeConfig = locales(keys[i])
    messages[locale][module] = localeConfig
  }
}

registerLocales(containerLocales)
registerLocales(scopeLocales)

const i18n = new VueI18n({
  locale: window.localStorage.getItem('language') || 'zh-CN',
  messages,
})

export default i18n
