import Vue from 'vue'
import validateForm from '@/utils/validate'

const promiseValidateForm = function (fc) {
  return new Promise((resolve, reject) => {
    fc.validateFields((err, values) => {
      if (!err) {
        resolve(values)
      } else {
        reject(err)
      }
    })
  })
}

export default {
  install () {
    Vue.prototype.$validate = validateForm
    Vue.prototype.$promiseValidateForm = promiseValidateForm
  },
}
