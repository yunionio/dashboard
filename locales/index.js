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

const i18n = new VueI18n({
  locale: window.localStorage.getItem('language') || 'zh-CN',
  messages,
  silentTranslationWarn: true,
})

export default i18n
