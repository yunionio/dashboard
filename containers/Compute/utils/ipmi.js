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
