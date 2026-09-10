import store from '@/store'
import { getConfiguredDocsUrl, getDocsUrl, isDocsDisabled } from './utils'

export const DOC_MAP = {
  QGA: 'function_principle/onpremise/vminstance/qga',
}

export const getDoc = (doc) => {
  if (isDocsDisabled()) return ''
  const configured = getConfiguredDocsUrl()
  if (configured) return configured
  return `${getDocsUrl(store.getters.scope, store.getters.isSysCE)}${doc}`
}
