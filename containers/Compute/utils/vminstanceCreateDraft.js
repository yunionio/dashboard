/**
 * 虚拟机创建：工单 initForm 回填辅助（非整表草稿）
 */
import { NETWORK_OPTIONS_MAP, LOGIN_TYPES_MAP } from '@Compute/constants'

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
 * @param {object} initData
 * @returns {string}
 */
export function resolveDraftLoginType (initData) {
  const fromExtra = initData?.extraData?.loginType
  if (fromExtra) return fromExtra
  if (initData?.keypair) return LOGIN_TYPES_MAP.keypair.key
  if (initData && Object.prototype.hasOwnProperty.call(initData, 'reset_password') && !initData.reset_password) {
    return LOGIN_TYPES_MAP.image.key
  }
  if (initData && Object.prototype.hasOwnProperty.call(initData, 'password') && initData.password) {
    return LOGIN_TYPES_MAP.password.key
  }
  return LOGIN_TYPES_MAP.random.key
}

/**
 * @param {object} initData
 * @returns {string}
 */
export function resolveDraftNetworkType (initData) {
  const nets = initData?.nets || initData?.extraData?.nets
  if (Array.isArray(nets) && nets.length) {
    if (nets.some(n => n && (n.network || n.network_id))) {
      return NETWORK_OPTIONS_MAP.manual.key
    }
  }
  const t = initData?.extraData?.networkType || initData?.extraData?.network_type
  if (t && NETWORK_OPTIONS_MAP[t]) return NETWORK_OPTIONS_MAP[t].key
  return NETWORK_OPTIONS_MAP.default.key
}

/**
 * 工单 initData 是否含高级区字段（仅用于跳过空回填，与 UI 展开无关）
 * @param {object} initData
 * @returns {boolean}
 */
export function hasAdvanceConfigInitFields (initData) {
  if (!initData || typeof initData !== 'object') return false
  return !!(
    initData.hostname ||
    initData.hostName ||
    initData.eip ||
    initData.eip_bw ||
    initData.public_ip_bw ||
    (Array.isArray(initData.secgroups) && initData.secgroups.length) ||
    initData.secgroup ||
    initData.schedtag ||
    initData.prefer_host ||
    initData.prefer_backup_host ||
    initData.encrypt_key_id ||
    initData.encrypt_key_new ||
    initData.user_data ||
    initData.custom_data_type ||
    initData.bastion_server ||
    initData.bios ||
    initData.vdi ||
    initData.vga ||
    initData.machine ||
    initData.is_daemon ||
    (Array.isArray(initData.groups) && initData.groups.length)
  )
}
