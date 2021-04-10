import Vue from 'vue'
import validateForm, { isValidateResourceLock } from '@/utils/validate'

export default {
  install () {
    Vue.prototype.$validate = validateForm
    Vue.prototype.$isValidateResourceLock = isValidateResourceLock
  },
}
