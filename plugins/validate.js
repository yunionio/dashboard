import Vue from 'vue'
import validateForm from '@/utils/validate'

export default {
  install () {
    Vue.prototype.$validate = validateForm
  },
}
