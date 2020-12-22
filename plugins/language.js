import Vue from 'vue'
import { getLanguage } from '@/utils/common/cookie'

export default {
  install () {
    Vue.prototype.$language = getLanguage() === 'zh-CN' ? 'zh' : 'en'
  },
}
