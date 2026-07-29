/**
 * RDS 创建草稿工具
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
export function mergeRdsCreateDraft (draft) {
  if (!draft || typeof draft !== 'object') return null
  return safeClone(draft) || { ...draft }
}

/**
 * 是否有可回填的配置
 * @param {object} draft
 * @returns {boolean}
 */
export function isMeaningfulRdsCreateDraft (draft) {
  const data = mergeRdsCreateDraft(draft) || draft
  if (!data || typeof data !== 'object') return false
  return !!(
    data.provider ||
    data.cloudregion ||
    data.engine ||
    data.sku ||
    data.sku_id ||
    data.sku_name ||
    data.vpc ||
    data.zones
  )
}

/**
 * 组装草稿（调用方宜先 omitIdentityFields）
 * @param {object} fields
 * @param {object} [extra]
 * @returns {object|null}
 */
export function buildRdsCreateDraftPayload (fields, extra = {}) {
  if (!fields || typeof fields !== 'object') return null
  const data = safeClone(fields) || { ...fields }
  // sku 只保留匹配所需字段，避免整包过大
  if (data.sku && typeof data.sku === 'object') {
    data.sku_id = data.sku.id
    data.sku_name = data.sku.name
    data.sku = {
      id: data.sku.id,
      name: data.sku.name,
    }
  }
  data.extraData = {
    ...(data.extraData || {}),
    ...extra,
  }
  return data
}
