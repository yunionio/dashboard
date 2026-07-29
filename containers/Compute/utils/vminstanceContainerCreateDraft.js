/**
 * 容器主机创建草稿：与工单 params 同形（GenCreateData.all()）
 *
 * 只存工单会存的提交体；回填走同一套 Decorator + initForm。
 * 不存 form.fd / form.fi 等工单用不到的字段。
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
 * @param {object} api
 * @returns {object|null}
 */
export function enrichContainerCreateApiDraft (api) {
  if (!api || typeof api !== 'object') return null
  const data = safeClone(api) || { ...api }
  if (!data.extraData) data.extraData = {}

  // 手动网络：历史/草稿可能只保留了 top-level nets，extraData.nets 为空
  // NetworkConfig.initData 依赖 extraData.nets，因此这里从 nets 补齐。
  if ((!Array.isArray(data.extraData.nets) || !data.extraData.nets.length) && Array.isArray(data.nets)) {
    const manualNets = data.nets.filter(n => n && typeof n === 'object' && n.network != null)
    if (manualNets.length) {
      data.extraData.nets = manualNets.map(n => {
        const next = { ...n }
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
  }

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

  // 安全组 / 指定宿主机：兼容只写在 extraData 的草稿
  if ((!Array.isArray(data.secgroups) || !data.secgroups.length) && Array.isArray(data.extraData.secgroups)) {
    data.secgroups = data.extraData.secgroups
  }
  if (!data.prefer_host && data.extraData.prefer_host) {
    data.prefer_host = data.extraData.prefer_host
  }

  // 端口映射：补到 nets[0]，便于统一读取
  const draftPortMappings = resolveDraftPortMappings(data)
  if (draftPortMappings.length) {
    if (!Array.isArray(data.nets) || !data.nets.length) {
      data.nets = [{ exit: false }]
    }
    if (!data.nets[0].port_mappings?.length) {
      data.nets[0] = { ...data.nets[0], port_mappings: draftPortMappings }
    }
    if (!data.extraData.port_mappings?.length) {
      data.extraData.port_mappings = draftPortMappings
    }
  }

  // 高级配置关闭时剔除字段，避免 Decorator / initForm 回填
  return applyAdvanceConfigOpenGate(data)
}

/**
 * 从草稿/工单中取出端口映射
 * @param {object} initData
 * @returns {Array<{port: *, host_port: *}>}
 */
export function resolveDraftPortMappings (initData) {
  if (!initData || typeof initData !== 'object') return []
  if (Array.isArray(initData.extraData?.port_mappings) && initData.extraData.port_mappings.length) {
    return initData.extraData.port_mappings
  }
  if (Array.isArray(initData.nets)) {
    for (let i = 0; i < initData.nets.length; i++) {
      const n = initData.nets[i]
      if (n && Array.isArray(n.port_mappings) && n.port_mappings.length) {
        return n.port_mappings
      }
    }
  }
  return []
}

/**
 * 草稿 → initFormData（与工单 params.data 同用）
 * 兼容误存的旧 hybrid { api, form }：只取 api
 * @param {object} draft
 * @returns {object|null}
 */
export function mergeContainerCreateDraftToInitFormData (draft) {
  if (!draft || typeof draft !== 'object') return null
  const raw = (draft.api && typeof draft.api === 'object') ? draft.api : draft
  return enrichContainerCreateApiDraft(raw)
}

/**
 * 组装待存草稿：工单同形 GenCreateData.all()
 * @param {object} apiPayload
 * @returns {object|null}
 */
export function buildContainerCreateDraftPayload (apiPayload) {
  if (!apiPayload || typeof apiPayload !== 'object') return null
  const data = safeClone(apiPayload) || { ...apiPayload }
  if (!data.extraData) data.extraData = {}
  return data
}

/**
 * 是否有可回填的配置（收紧：不能仅靠 hypervisor 空壳）
 */
export function isMeaningfulContainerCreateDraft (draft) {
  const api = mergeContainerCreateDraftToInitFormData(draft) || draft?.api || draft
  if (!api || typeof api !== 'object') return false
  const containers = api.pod?.containers || []
  const hasContainerImage = containers.some(c => c && (c.image || c.name))
  return !!(
    api.prefer_region ||
    api.prefer_zone ||
    api.sku ||
    (Array.isArray(api.prefer_zones) && api.prefer_zones.length) ||
    (api.disks && api.disks.length) ||
    (api.nets && api.nets.length) ||
    hasContainerImage
  )
}

/**
 * 草稿/工单是否含「高级配置」内容（用于展开 collapse）
 * 注意：hostname 默认被草稿 omit，不能只靠 hostname 判断
 */
export function needOpenAdvanceConfig (initData) {
  if (!initData || typeof initData !== 'object') return false
  const hasPortMappings = resolveDraftPortMappings(initData).length > 0
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
    hasPortMappings
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
 * 优先读草稿里用户关掉/打开的记录；旧草稿无记录时：有高级配置内容则展开
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
  'prefer_host',
  'schedtags',
  'secgroups',
  'network_tags',
  'groups',
]

/** 高级配置相关的 extraData 字段 */
const ADVANCE_CONFIG_EXTRA_KEYS = [
  'secgroups',
  'prefer_host',
  'schedtags',
  'port_mappings',
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
  // nets 上的 port_mappings
  if (Array.isArray(data.nets)) {
    data.nets = data.nets.map((net) => {
      if (!net || typeof net !== 'object' || !net.port_mappings) return net
      const next = { ...net }
      delete next.port_mappings
      return next
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
 * 与工单 initForm 相同的 networkType 推断
 */
export function resolveDraftNetworkType (initData) {
  const firstNet = initData?.nets?.[0]
  if (!firstNet) return NETWORK_OPTIONS_MAP.default.key

  // 调度标签网络
  if (firstNet.schedtags) return NETWORK_OPTIONS_MAP.schedtag.key

  // 手动子网（top-level nets 里应有 network 字段）
  if (firstNet.hasOwnProperty('network')) return NETWORK_OPTIONS_MAP.manual.key

  // 兜底：历史草稿可能只保留 extraData.nets
  const extraNet = initData.extraData?.nets?.[0]
  if (extraNet && (extraNet.hasOwnProperty('network') || extraNet.network_id)) {
    return NETWORK_OPTIONS_MAP.manual.key
  }

  // 默认网络（exit=false）
  if (firstNet.hasOwnProperty('exit') && !firstNet.exit) {
    return NETWORK_OPTIONS_MAP.default.key
  }

  return NETWORK_OPTIONS_MAP.schedtag.key
}
