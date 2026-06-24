import expectStatus from '@/constants/expectStatus'

/** 列表 steadyStatus：导入中需继续轮询，不包含 importing_model */
export function getLlmSkuListSteadyStatuses () {
  const m = expectStatus.llmSku || {}
  const info = (m.info || []).filter(s => s !== 'importing_model')
  return [...new Set([...(m.success || []), ...(m.danger || []), ...info])]
}
