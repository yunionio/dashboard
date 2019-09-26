/**
 * Rquest
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/08/08
 */

import Vue from 'vue'
import list from '@/utils/list'

export default {
  install () {
    Vue.prototype.$list = list
  },
}
