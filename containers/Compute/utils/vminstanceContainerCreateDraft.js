/**
 * 容器主机创建：工单 initForm 回填辅助（非整表草稿）
 */
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'

/** 从工单数据取出端口映射 */
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

/** 工单 initData 是否含高级区字段（仅用于跳过空回填，与 UI 展开无关） */
export function hasAdvanceConfigInitFields (initData) {
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

/** 与工单 initForm 相同的 networkType 推断 */
export function resolveDraftNetworkType (initData) {
  const firstNet = initData?.nets?.[0]
  if (!firstNet) return NETWORK_OPTIONS_MAP.default.key
  if (firstNet.schedtags) return NETWORK_OPTIONS_MAP.schedtag.key
  if (Object.prototype.hasOwnProperty.call(firstNet, 'network')) return NETWORK_OPTIONS_MAP.manual.key
  const extraNet = initData.extraData?.nets?.[0]
  if (extraNet && (Object.prototype.hasOwnProperty.call(extraNet, 'network') || extraNet.network_id)) {
    return NETWORK_OPTIONS_MAP.manual.key
  }
  if (Object.prototype.hasOwnProperty.call(firstNet, 'exit') && !firstNet.exit) {
    return NETWORK_OPTIONS_MAP.default.key
  }
  return NETWORK_OPTIONS_MAP.schedtag.key
}
