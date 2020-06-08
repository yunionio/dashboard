// 报警级别
export const LEVEL_CN = {
  normal: {
    label: '普通',
    color: 'cyan',
  },
  important: {
    label: '重要',
    color: 'orange',
  },
  fatal: {
    label: '致命',
    color: 'red',
  },
}

export const metricItems = {
  // 虚拟机
  'vm_cpu.usage_active': { key: 'vm_cpu.usage_active', label: 'CPU使用率(usage_active)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  'vm_mem.used_percent': { key: 'vm_mem.used_percent', label: '内存使用率(used_percent)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  'vm_netio.bps_recv': { key: 'vm_netio.bps_recv', label: '网络入流量(bps_recv)', unit: 'bps' },
  'vm_netio.bps_sent': { key: 'vm_netio.bps_sent', label: '网络出流量(bps_sent)', unit: 'bps' },
  'vm_diskio.read_bps': { key: 'vm_diskio.read_bps', label: '磁盘读速率(read_bps)', unit: 'bps' },
  'vm_diskio.write_bps': { key: 'vm_diskio.write_bps', label: '磁盘写速率(write_bps)', unit: 'bps' },
  // KVM宿主机
  'usage_active,usage_idle,usage_user,usage_system,usage_iowait': { key: 'usage_active,usage_idle,usage_user,usage_system,usage_iowait', label: 'CPU使用率(usage_active,usage_idle,usage_user,usage_system,usage_iowait)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  'load1,load5,load15,load1_pcore,load5_pcore,load15_pcore': { key: 'load1,load5,load15,load1_pcore,load5_pcore,load15_pcore', label: '系统负载情况(load1,load5,load15,load1_pcore,load5_pcore,load15_pcore)', unit: '%' },
  used_percent: { key: 'used_percent', label: '内存使用率(used_percent)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  'used,free,total': { key: 'used,free,total', label: '内存使用情况(used,free,total)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  // 'used_percent': { key: 'used_percent', label: '磁盘使用率(used_percent)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  // 'used,free,total': { key: 'used,free,total', label: '磁盘使用情况(used,free,total)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  ioutil: { key: 'ioutil', label: '磁盘IO使用率(ioutil)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  'read_iops,write_iops': { key: 'read_iops,write_iops', label: '磁盘IOPS(read_iops,write_iops)', unit: '%' },
  bps_recv: { key: 'bps_recv', label: '网络入流量(bps_recv)', unit: '%' },
  bps_sent: { key: 'bps_sent', label: '网络出流量(bps_sent)', unit: '%' },
  // VMWARE宿主机
  usage_active: { key: 'usage_active', label: 'CPU使用率(usage_active)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  // 'used_percent': { key: 'used_percent', label: '内存使用率(used_percent)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  read_bps: { key: 'read_bps', label: '磁盘读取速率(read_bps)', unit: '%' },
  write_bps: { key: 'write_bps', label: '磁盘写入速率(write_bps)', unit: '%' },
  // 'bps_recv': { key: 'bps_recv', label: '网络入流量(bps_recv)', unit: '%' },
  // 'bps_sent': { key: 'bps_sent', label: '网络出流量(bps_sent)', unit: '%' },
}

export const TIME_CN = {
  s: '秒',
  m: '分钟',
  h: '小时',
}

export const channelMap = {
  email: '邮件',
  moblie: '短信',
  dingtalk: '钉钉通知',
}
