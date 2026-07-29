/**
 * 硬盘创建草稿工具
 * payload 为表单字段平铺 + extraData（UI 展开态）
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
export function mergeDiskCreateDraft (draft) {
  if (!draft || typeof draft !== 'object') return null
  return safeClone(draft) || { ...draft }
}

/**
 * 是否有可回填的配置
 * @param {object} draft
 * @returns {boolean}
 */
export function isMeaningfulDiskCreateDraft (draft) {
  const data = mergeDiskCreateDraft(draft) || draft
  if (!data || typeof data !== 'object') return false
  return !!(
    data.cloudregion ||
    data.zone ||
    data.backend ||
    data.hypervisor ||
    data.manager_id ||
    data.provider ||
    (data.size != null && data.size !== 10) ||
    data.storage ||
    data.storage_id
  )
}

/**
 * 组装草稿（调用方宜先 omitIdentityFields）
 * @param {object} fields
 * @param {object} [extra]
 * @returns {object|null}
 */
export function buildDiskCreateDraftPayload (fields, extra = {}) {
  if (!fields || typeof fields !== 'object') return null
  const data = safeClone(fields) || { ...fields }
  data.extraData = {
    ...(data.extraData || {}),
    ...extra,
  }
  return data
}
