import i18n from '@/locales'

const isTrue = val => val === true || val === 'true'

// 无 IPMI 信息时的禁用结果
const noIpmiTip = () => ({
  validate: false,
  tooltip: i18n.t('compute.no_ipmi_tooltip'),
})

// 物理机是否没有 IPMI 信息
export const isHostNoIpmi = (host = {}) => !host.ipmi_ip

// 裸金属的物理机是否为托管物理机
export const isFakeBaremetalServer = (server = {}) => {
  const metadata = server.metadata || {}
  return isTrue(metadata.is_fake_baremetal_server)
}

// 裸金属是否没有 IPMI 信息
export const isServerNoIpmi = (server = {}) => isTrue(server.host_no_ipmi)

// 物理机（单条）：无 ipmi_ip 时返回禁用结果，否则返回 null
export const hostNoIpmiTip = (host) => {
  return isHostNoIpmi(host) ? noIpmiTip() : null
}

// 物理机（批量）：选中项中任一无 ipmi_ip 时返回禁用结果，否则返回 null
export const hostsNoIpmiTip = (hosts = []) => {
  return (hosts || []).some(isHostNoIpmi) ? noIpmiTip() : null
}

// 裸金属（单条）：托管物理机分配且无 IPMI 时返回禁用结果，用于开机、关机、重启、同步状态
export const baremetalNoIpmiTip = (server) => {
  if (isFakeBaremetalServer(server) && isServerNoIpmi(server)) return noIpmiTip()
  return null
}

// 裸金属（批量）：选中项中任一为托管物理机分配且无 IPMI 时返回禁用结果
export const baremetalsNoIpmiTip = (servers = []) => {
  const items = servers || []
  if (items.some(item => isFakeBaremetalServer(item) && isServerNoIpmi(item))) return noIpmiTip()
  return null
}

// 托管裸金属允许删除时，删除请求需附带 override_pending_delete（单行默认删除用）
export const baremetalDeleteRequestParams = (servers) => {
  const items = Array.isArray(servers) ? servers : [servers]
  if ((items || []).some(isFakeBaremetalServer)) {
    return { override_pending_delete: true }
  }
  return {}
}

export const partitionBaremetalDeleteByOverride = (servers = []) => {
  const withOverride = []
  const withoutOverride = []
  servers.forEach(server => {
    if (isFakeBaremetalServer(server)) {
      withOverride.push(server)
    } else {
      withoutOverride.push(server)
    }
  })
  return { withOverride, withoutOverride }
}

const baremetalDeleteBlockedLabel = (item) => {
  const name = String(item?.name || '').trim()
  if (name) return name
  return String(item?.id || '').trim()
}

const baremetalDeleteBlockedReason = (item) => {
  return baremetalDeleteBlockedTipWhenCannotDelete(item).tooltip || ''
}

// 批量删除按钮 meta：与单行一致，仅 can_delete 为 false 时区分托管/no ipmi
export const baremetalsDeleteMeta = (items = []) => {
  const blocked = items.filter(item => !item?.can_delete)
  if (!blocked.length) {
    return { validate: true, tooltip: null }
  }
  const lines = blocked.map(item => {
    const label = baremetalDeleteBlockedLabel(item)
    const reason = baremetalDeleteBlockedReason(item)
    if (label && reason) return `${label}: ${reason}`
    if (label) return label
    if (reason) return reason
    return ''
  }).filter(line => !!line)
  return {
    validate: false,
    tooltip: lines.length > 0 ? lines.join('\n') : i18n.t('common_604'),
  }
}

// 裸金属（单条）删除：仅在 can_delete 为 false 时区分托管/no ipmi；can_delete 为 true 时不拦截
export const baremetalDeleteBlockedTipWhenCannotDelete = (server) => {
  if (isFakeBaremetalServer(server)) {
    if (isServerNoIpmi(server)) return noIpmiTip()
    return {
      validate: false,
      tooltip: i18n.t('compute.tooltip.check_fake_baremetal_server'),
    }
  }
  return {
    validate: false,
    tooltip: i18n.t('compute.text_284'),
  }
}

// 裸金属（单条）：删除、重装系统，托管物理机分配的裸金属禁用；无 IPMI 时优先提示 no ipmi
export const baremetalFakeTip = (server) => {
  if (!isFakeBaremetalServer(server)) return null
  if (isServerNoIpmi(server)) return noIpmiTip()
  return {
    validate: false,
    tooltip: i18n.t('compute.tooltip.check_fake_baremetal_server'),
  }
}

// 裸金属（批量）：删除，选中项中任一为托管物理机分配的裸金属即禁用
export const baremetalsFakeTip = (servers = []) => {
  const items = servers || []
  if (items.some(item => isFakeBaremetalServer(item) && isServerNoIpmi(item))) return noIpmiTip()
  if (items.some(isFakeBaremetalServer)) {
    return {
      validate: false,
      tooltip: i18n.t('compute.tooltip.check_fake_baremetal_server'),
    }
  }
  return null
}
