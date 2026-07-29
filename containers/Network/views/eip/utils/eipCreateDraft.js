/**
 * EIP（弹性公网 IP）创建草稿工具
 * payload 为表单字段平铺 + extraData（UI 态）
 */
function safeClone (val) {
  try {
    return JSON.parse(JSON.stringify(val))
  } catch (e) {
    return undefined
  }
}

/**
 * @param {object} draft
 * @returns {object|null}
 */
export function mergeEipCreateDraft (draft) {
  if (!draft || typeof draft !== 'object') return null
  return safeClone(draft) || { ...draft }
}

/**
 * 是否有可回填的配置
 * @param {object} draft
 * @returns {boolean}
 */
export function isMeaningfulEipCreateDraft (draft) {
  const data = mergeEipCreateDraft(draft) || draft
  if (!data || typeof data !== 'object') return false
  return !!(
    data.cloudregion ||
    data.provider ||
    data.manager ||
    data.vpc ||
    data.network ||
    data.bgp_type ||
    (data.bandwidth != null && data.bandwidth !== 30) ||
    data.charge_type
  )
}

/**
 * 组装草稿（调用方宜先 omitIdentityFields）
 * @param {object} fields
 * @param {object} [extra]
 * @returns {object|null}
 */
export function buildEipCreateDraftPayload (fields, extra = {}) {
  if (!fields || typeof fields !== 'object') return null
  const data = safeClone(fields) || { ...fields }
  data.extraData = {
    ...(data.extraData || {}),
    ...extra,
  }
  return data
}
