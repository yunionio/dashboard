/**
 * 裸金属创建草稿：与工单 params 同形（handleConfirm 组装体）
 *
 * 只存工单会存的提交体；回填走同一套 Decorator + initForm。
 * 不落盘明文密码；bonding 等 UI 态写入 extraData。
 */
function safeClone (val) {
  try {
    return JSON.parse(JSON.stringify(val))
  } catch (e) {
    return undefined
  }
}

/**
 * 读盘轻量补齐：manual 网络认 network / network_id
 * @param {object} api
 * @returns {object|null}
 */
export function enrichBaremetalCreateApiDraft (api) {
  if (!api || typeof api !== 'object') return null
  const data = safeClone(api) || { ...api }
  if (!data.extraData) data.extraData = {}

  // 历史草稿可能误存明文密码：读盘即清
  delete data.password
  delete data.extraData.loginPassword
  // 裸金属无折叠高级配置，忽略历史误存的开关
  delete data.extraData.advance_config_open

  if (Array.isArray(data.extraData.extraNets)) {
    data.extraData.extraNets = data.extraData.extraNets.map(net => {
      if (!net || typeof net !== 'object') return net
      const next = { ...net }
      if (typeof next.network === 'object') {
        next.network = next.network.id || next.network.key || next.network_id
      }
      if (typeof next.vpc === 'object') {
        next.vpc = next.vpc.id || next.vpc.key
      }
      if (next.network && !next.network_id) {
        next.network_id = next.network
      }
      return next
    })
  }
  return data
}

/**
 * 草稿 → initFormData（与工单 params.data 同用）
 * @param {object} draft
 * @returns {object|null}
 */
export function mergeBaremetalCreateDraftToInitFormData (draft) {
  if (!draft || typeof draft !== 'object') return null
  const raw = (draft.api && typeof draft.api === 'object') ? draft.api : draft
  return enrichBaremetalCreateApiDraft(raw)
}

/**
 * 组装待存草稿
 * @param {object} apiPayload
 * @param {object} [options]
 * @param {string} [options.loginType]
 * @param {boolean} [options.isBonding]
 * @returns {object|null}
 */
export function buildBaremetalCreateDraftPayload (apiPayload, options = {}) {
  if (!apiPayload || typeof apiPayload !== 'object') return null
  const data = safeClone(apiPayload) || { ...apiPayload }
  if (!data.extraData) data.extraData = {}
  delete data.password
  delete data.extraData.loginPassword
  delete data.extraData.advance_config_open
  if (options.loginType) {
    data.extraData.loginType = options.loginType
  }
  if (typeof options.isBonding === 'boolean') {
    data.extraData.isBonding = options.isBonding
  }
  // 双写调度字段，避免某一链路丢失
  if (data.prefer_host) data.extraData.prefer_host = data.prefer_host
  if (data.schedtags?.length) data.extraData.schedtags = data.schedtags
  return data
}

/**
 * 解析管理员密码方式（优先 extraData.loginType）
 */
export function resolveDraftLoginType (initData) {
  const fromExtra = initData?.extraData?.loginType
  if (fromExtra) return fromExtra
  if (initData?.keypair) return 'keypair'
  if (initData && Object.prototype.hasOwnProperty.call(initData, 'reset_password') && !initData.reset_password) {
    return 'image'
  }
  if (initData && Object.prototype.hasOwnProperty.call(initData, 'password') && initData.password) {
    return 'password'
  }
  return 'random'
}

/**
 * 是否有可回填的配置
 */
export function isMeaningfulBaremetalCreateDraft (draft) {
  const api = mergeBaremetalCreateDraftToInitFormData(draft) || draft?.api || draft
  if (!api || typeof api !== 'object') return false
  const extra = api.extraData || {}
  return !!(
    api.prefer_region ||
    api.prefer_zone ||
    (Array.isArray(api.prefer_zones) && api.prefer_zones.length) ||
    extra.specifications ||
    extra.image ||
    extra.os ||
    (api.baremetal_disk_configs && api.baremetal_disk_configs.length) ||
    (api.disks && api.disks.length) ||
    (api.nets && api.nets.length)
  )
}
