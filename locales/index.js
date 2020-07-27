import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from './en'
import zhCN from './zh-CN'
import helpEN from './help-en'
import helpZhCN from './help-zh-CN'
import { getLanguage } from '@/utils/common/cookie'

Vue.use(VueI18n)

const messages = {
  en: Object.assign(en, helpEN),
  'zh-CN': Object.assign(zhCN, helpZhCN),
}

const i18n = new VueI18n({
  locale: getLanguage(),
  messages,
  // silentTranslationWarn: true,
})

export default i18n
