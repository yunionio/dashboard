import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from './en'
import zhCN from './zh-CN'
import helpEN from './help-en'
import helpZhCN from './help-zh-CN'
import { getLanguage } from '@/utils/common/cookie'
import setting from '@/config/setting'

Vue.use(VueI18n)

const messages = {
  en: Object.assign(en, helpEN, { brand: setting.brand.en }),
  'zh-CN': Object.assign(zhCN, helpZhCN, { brand: setting.brand['zh-CN'] }),
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
  fallbackLocale: 'zh-CN',
  // silentTranslationWarn: true,
})

export default i18n
