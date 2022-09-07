const url = window.location.origin

export const DOC_MAP = {
  QGA: 'docs/function_principle/onpremise/vminstance/qga',
}

export const getDoc = (lang, doc) => {
  return `${url}/${lang}/${doc}`
}
