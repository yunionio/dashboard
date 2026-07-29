/**
 * 虚拟机创建草稿：与工单 params 同形（GenCreateData.all()）
 *
 * 只存工单会存的提交体；回填走同一套 Decorator + initForm。
 * 不存 form.fd / form.fi 等工单用不到的字段。
 * 不落盘明文密码；自定义数据仅处理文本（input），忽略 file。
 */
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'

function safeClone (val) {
  try {
    return JSON.parse(JSON.stringify(val))
  } catch (e) {
    return undefined
  }
}

/**
 * 读盘时轻量补齐：Decorator 旧逻辑认 network_id，GenCreateData 只写 network
 * （不写入存储；工单 params 里也可能缺 network_id，initForm 仍靠 nets 结构推断）
 * @param {object} api
 * @returns {object|null}
 */
export function enrichServerCreateApiDraft (api) {
  if (!api || typeof api !== 'object') return null
  const data = safeClone(api) || { ...api }
  if (!data.extraData) data.extraData = {}

  // 历史草稿可能误存明文密码：读盘即清
  delete data.password
  delete data.extraData.loginPassword

  if (Array.isArray(data.extraData.nets)) {
    data.extraData.nets = data.extraData.nets.map(net => {
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
  // 自定义数据：仅文本 input；file 不读写
  if (data.custom_data_type === 'file') {
    delete data.custom_data_type
    delete data.user_data
    delete data.extraData.user_data
  } else {
    const ud = normalizeDraftUserData(data.user_data) || normalizeDraftUserData(data.extraData.user_data)
    if (ud && (data.custom_data_type === 'input' || !data.custom_data_type)) {
      data.user_data = ud
      if (!data.custom_data_type) data.custom_data_type = 'input'
    } else {
      delete data.user_data
      delete data.extraData.user_data
    }
  }
  // 高级配置关闭时剔除字段，避免 Decorator / initForm 回填
  return applyAdvanceConfigOpenGate(data)
}

/**
 * 自定义数据正文统一为非空字符串；忽略 [] / 空串
 * @param {*} val
 * @returns {string|undefined}
 */
export function normalizeDraftUserData (val) {
  if (val == null || val === '') return undefined
  if (typeof val === 'string') return val || undefined
  if (Array.isArray(val)) return undefined
  const s = String(val)
  return s || undefined
}

/**
 * 草稿 → initFormData（与工单 params.data 同用）
 * 兼容误存的旧 hybrid { api, form }：只取 api
 * @param {object} draft
 * @returns {object|null}
 */
export function mergeServerCreateDraftToInitFormData (draft) {
  if (!draft || typeof draft !== 'object') return null
  // 旧 hybrid：丢掉 form，只留工单同形 api
  const raw = (draft.api && typeof draft.api === 'object') ? draft.api : draft
  return enrichServerCreateApiDraft(raw)
}

/**
 * 组装待存草稿：工单同形 GenCreateData.all()，并补齐回填所需字段
 * @param {object} apiPayload
 * @param {object} [options]
 * @param {string} [options.loginType] 管理员密码方式（只记方式，不落明文密码）
 * @param {*} [options.user_data] 自定义数据内容（仅 input 文本）
 * @returns {object|null}
 */
export function buildServerCreateDraftPayload (apiPayload, options = {}) {
  if (!apiPayload || typeof apiPayload !== 'object') return null
  const data = safeClone(apiPayload) || { ...apiPayload }
  if (!data.extraData) data.extraData = {}
  // 去掉我们曾误加、工单没有的字段
  delete data.extraData.networkType
  delete data.extraData._formNetworkType
  delete data.extraData._formSelections
  delete data.extraData._formImage
  delete data.extraData._formImageType
  delete data.extraData._formOs
  delete data.extraData._formSystemDiskType
  delete data.extraData._formSystemDiskSize
  delete data.extraData._formSku
  delete data.extraData._formCloudregion
  delete data.extraData._formZone
  delete data.extraData._formProvider
  delete data.extraData._formDomain
  delete data.extraData._formProject
  // 不落明文密码（含历史误存字段）
  delete data.password
  delete data.extraData.loginPassword
  if (options.loginType) {
    data.extraData.loginType = options.loginType
  }
  // 自定义数据：仅文本 input；file 不落盘
  const customType = data.custom_data_type
  if (customType === 'file') {
    delete data.custom_data_type
    delete data.user_data
    delete data.extraData.user_data
  } else {
    const userData = customType === 'input'
      ? (normalizeDraftUserData(options.user_data) || normalizeDraftUserData(data.user_data))
      : undefined
    if (userData) {
      data.custom_data_type = 'input'
      data.user_data = userData
      data.extraData.user_data = userData
    } else {
      delete data.user_data
      delete data.extraData.user_data
      if (customType !== 'input') delete data.custom_data_type
    }
  }
  return data
}

/**
 * 解析管理员密码方式（优先 extraData.loginType，再回退工单字段推断）
 * 草稿不回填明文密码，仅恢复方式
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
 * 是否有可回填的配置（收紧：不能仅靠 hypervisor 空壳）
 */
export function isMeaningfulServerCreateDraft (draft) {
  const api = mergeServerCreateDraftToInitFormData(draft) || draft?.api || draft
  if (!api || typeof api !== 'object') return false
  const extra = api.extraData || {}
  return !!(
    api.prefer_region ||
    api.sku ||
    (Array.isArray(api.prefer_zones) && api.prefer_zones.length) ||
    (api.disks && api.disks.length) ||
    (api.nets && api.nets.length) ||
    (Array.isArray(extra.providers) && extra.providers.length) ||
    (Array.isArray(extra.prefer_regions) && extra.prefer_regions.length)
  )
}

/**
 * 与工单 initForm 相同的 networkType 推断
 */
export function resolveDraftNetworkType (initData) {
  if (!initData?.nets?.[0]) return NETWORK_OPTIONS_MAP.default.key
  if (initData.nets[0].hasOwnProperty('exit') && !initData.nets[0].exit) {
    return NETWORK_OPTIONS_MAP.default.key
  }
  const extraNet = initData.extraData?.nets?.[0]
  // 工单历史：认 network；读盘 enrich 后也有 network_id
  if (
    initData.nets[0].hasOwnProperty('network') &&
    extraNet &&
    (extraNet.hasOwnProperty('network') || extraNet.network_id)
  ) {
    return NETWORK_OPTIONS_MAP.manual.key
  }
  if (initData.nets[0].schedtags) {
    return NETWORK_OPTIONS_MAP.schedtag.key
  }
  return NETWORK_OPTIONS_MAP.schedtag.key
}

/**
 * 草稿/工单是否含「高级配置」内容（用于兼容旧草稿展开 collapse）
 * 注意：hostname 默认被草稿 omit，不能只靠 hostname 判断
 */
export function needOpenAdvanceConfig (initData) {
  if (!initData || typeof initData !== 'object') return false
  return !!(
    initData.hostname ||
    initData.eip_charge_type ||
    initData.public_ip_charge_type ||
    initData.eip ||
    initData.prefer_host ||
    (Array.isArray(initData.schedtags) && initData.schedtags.length) ||
    (Array.isArray(initData.extraData?.schedtags) && initData.extraData.schedtags.length) ||
    (Array.isArray(initData.secgroups) && initData.secgroups.length) ||
    (Array.isArray(initData.network_tags) && initData.network_tags.length) ||
    (Array.isArray(initData.groups) && initData.groups.length) ||
    initData.bios ||
    initData.vdi ||
    initData.vga ||
    initData.machine ||
    initData.is_daemon ||
    initData.prefer_backup_host ||
    initData.encrypt_key_id ||
    initData.encrypt_key_new ||
    initData.user_data ||
    initData.custom_data_type ||
    initData.bastion_server
  )
}

/**
 * 草稿是否明确要求展开高级配置
 * @param {object} initData
 * @returns {boolean}
 */
export function isAdvanceConfigOpenFromDraft (initData) {
  const flag = initData?.extraData?.advance_config_open
  if (typeof flag === 'boolean') return flag
  // 旧草稿无开关：有高级配置内容则视为打开
  return needOpenAdvanceConfig(initData)
}

/**
 * 高级配置折叠面板初始 activeKey
 * @param {object} initData
 * @returns {string[]}
 */
export function resolveAdvanceConfigCollapseActive (initData) {
  return isAdvanceConfigOpenFromDraft(initData) ? ['1'] : []
}

/** 高级配置相关的顶层字段（关闭时不落盘、不回填） */
const ADVANCE_CONFIG_TOP_KEYS = [
  'hostname',
  'eip',
  'eip_bw',
  'eip_charge_type',
  'eip_bgp_type',
  'public_ip_charge_type',
  'public_ip_bw',
  'public_ip_bgp_type',
  'prefer_host',
  'schedtags',
  'secgroups',
  'network_tags',
  'groups',
  'bios',
  'vdi',
  'vga',
  'machine',
  'is_daemon',
  'prefer_backup_host',
  'encrypt_key_id',
  'encrypt_key_alg',
  'encrypt_key_new',
  'user_data',
  'custom_data_type',
  'bastion_server',
]

/** 高级配置相关的 extraData 字段 */
const ADVANCE_CONFIG_EXTRA_KEYS = [
  'secgroups',
  'prefer_host',
  'schedtags',
  'user_data',
]

/**
 * 关闭高级配置时，从草稿 payload 中剔除高级配置字段（保留 advance_config_open: false）
 * @param {object} api
 * @returns {object}
 */
export function stripAdvanceConfigFields (api) {
  if (!api || typeof api !== 'object') return api
  const data = { ...api }
  ADVANCE_CONFIG_TOP_KEYS.forEach((k) => {
    delete data[k]
  })
  if (data.extraData && typeof data.extraData === 'object') {
    data.extraData = { ...data.extraData }
    ADVANCE_CONFIG_EXTRA_KEYS.forEach((k) => {
      delete data.extraData[k]
    })
  }
  return data
}

/**
 * 读盘时：若高级配置已关闭，去掉其中字段，避免 Decorator 种子带上
 * @param {object} api
 * @returns {object}
 */
export function applyAdvanceConfigOpenGate (api) {
  if (!api || typeof api !== 'object') return api
  if (api.extraData?.advance_config_open === false) {
    return stripAdvanceConfigFields(api)
  }
  return api
}

/**
 * 按折叠开关组装待存草稿
 * @param {object} apiPayload
 * @param {string[]|*} collapseActive
 * @param {object} [options]
 * @returns {object|null}
 */
export function buildServerCreateDraftPayloadWithAdvanceGate (apiPayload, collapseActive, options = {}) {
  if (!apiPayload || typeof apiPayload !== 'object') return null
  const data = safeClone(apiPayload) || { ...apiPayload }
  if (!data.extraData) data.extraData = {}
  const advanceOpen = Array.isArray(collapseActive) && collapseActive.includes('1')
  data.extraData.advance_config_open = advanceOpen
  if (!advanceOpen) {
    return buildServerCreateDraftPayload(stripAdvanceConfigFields(data), options)
  }
  // 双写：防顶层字段丢失，回填仍能取到
  if (data.secgroups?.length) data.extraData.secgroups = data.secgroups
  if (data.prefer_host) data.extraData.prefer_host = data.prefer_host
  if (data.schedtags?.length) data.extraData.schedtags = data.schedtags
  return buildServerCreateDraftPayload(data, options)
}
