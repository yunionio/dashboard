import { getDeleteResult } from '@/utils/error'

export default {
  install: Vue => {
    Vue.prototype.$getDeleteResult = getDeleteResult
  },
}
