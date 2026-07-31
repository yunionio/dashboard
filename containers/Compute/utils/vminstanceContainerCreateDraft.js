/**
 * 容器主机创建：工单回填辅助（非整表草稿）
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

  if ((!Array.isArray(data.secgroups) || !data.secgroups.length) && Array.isArray(data.extraData.secgroups)) {
    data.secgroups = data.extraData.secgroups
  }
  if (!data.prefer_host && data.extraData.prefer_host) {
    data.prefer_host = data.extraData.prefer_host
  }

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

  return applyAdvanceConfigOpenGate(data)
}

/**
 * 从工单/回填数据中取出端口映射
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
 * 工单/回填是否含「高级配置」内容（用于展开 collapse）
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
 * 回填数据是否明确要求展开高级配置
 * @param {object} initData
 * @returns {boolean}
 */
export function isAdvanceConfigOpenFromDraft (initData) {
  const flag = initData?.extraData?.advance_config_open
  if (typeof flag === 'boolean') return flag
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

/** 高级配置相关的 extraData 字段 */
const ADVANCE_CONFIG_EXTRA_KEYS = [
  'secgroups',
  'prefer_host',
  'schedtags',
  'port_mappings',
]

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

  if (firstNet.schedtags) return NETWORK_OPTIONS_MAP.schedtag.key

  if (firstNet.hasOwnProperty('network')) return NETWORK_OPTIONS_MAP.manual.key

  const extraNet = initData.extraData?.nets?.[0]
  if (extraNet && (extraNet.hasOwnProperty('network') || extraNet.network_id)) {
    return NETWORK_OPTIONS_MAP.manual.key
  }

  if (firstNet.hasOwnProperty('exit') && !firstNet.exit) {
    return NETWORK_OPTIONS_MAP.default.key
  }

  return NETWORK_OPTIONS_MAP.schedtag.key
}

/** 高级配置相关的顶层字段（关闭时不回填） */
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

/**
 * 关闭高级配置时，从 payload 中剔除高级配置字段
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
