/**
 * Rquest
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/08/08
 */

import Vue from 'vue'
import http from '@/utils/http'

export default {
  install () {
    Vue.prototype.$http = http
    Vue.http = http
  },
}
