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
  'vm_cpu.usage_active': { key: 'vm_cpu.usage_active', label: 'CPU使用率(usage_active)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  'vm_mem.used_percent': { key: 'vm_mem.used_percent', label: '内存使用率(used_percent)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  'vm_netio.bps_recv': { key: 'vm_netio.bps_recv', label: '网络入流量(bps_recv)', unit: 'bps' },
  'vm_netio.bps_sent': { key: 'vm_netio.bps_sent', label: '网络出流量(bps_sent)', unit: 'bps' },
  'vm_diskio.read_bps': { key: 'vm_diskio.read_bps', label: '磁盘读速率(read_bps)', unit: 'bps' },
  'vm_diskio.write_bps': { key: 'vm_diskio.write_bps', label: '磁盘写速率(write_bps)', unit: 'bps' },
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
