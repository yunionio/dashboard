/**
 * Rquest
 * author: wangpeng <945970854@qq.com>
 * date: 2019/08/08
 */

import Vue from 'vue'
import validateForm from '@/utils/validate'

export default {
  install () {
    Vue.prototype.$validate = validateForm
  },
}
