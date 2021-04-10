import Vue from 'vue'
import { isScopedPolicyMenuHidden, getScopedPolicyMenuHook, openNewWindowForMenuHook } from '@/utils/scopedPolicy'

export default {
  install () {
    Vue.prototype.$isScopedPolicyMenuHidden = isScopedPolicyMenuHidden
    Vue.prototype.$getScopedPolicyMenuHook = getScopedPolicyMenuHook
    Vue.prototype.$openNewWindowForMenuHook = openNewWindowForMenuHook
  },
}
