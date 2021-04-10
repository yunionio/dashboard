import { getDeleteResult, isOwner } from '@/utils/error'

export default {
  install: Vue => {
    Vue.prototype.$getDeleteResult = getDeleteResult
    Vue.prototype.$isOwner = isOwner
  },
}
