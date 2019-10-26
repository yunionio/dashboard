/**
 * API Manager
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/10/25
 */

import Vue from 'vue'
import { Manager } from '@/utils/manager'

export default {
  install () {
    Vue.prototype.$Manager = Manager
  },
}
