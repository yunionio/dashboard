import store from '@/store'
import { getDocsUrl } from './utils'

export const DOC_MAP = {
  QGA: 'function_principle/onpremise/vminstance/qga',
}

export const getDoc = (doc) => {
  return `${getDocsUrl(store.getters.scope, store.getters.isSysCE)}${doc}`
}
