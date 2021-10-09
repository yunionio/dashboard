import i18n from '@/locales'
// 报警级别
export const LEVEL_CN = {
  normal: {
    label: i18n.t('compute.text_750'),
    color: 'cyan',
  },
  important: {
    label: i18n.t('compute.text_751'),
    color: 'orange',
  },
  fatal: {
    label: i18n.t('compute.text_752'),
    color: 'red',
  },
}

export const metricItems = {
  // 虚拟机
  'vm_cpu.usage_active': { key: 'vm_cpu.usage_active', label: i18n.t('compute.text_753'), unit: '%', rules: [{ max: 100, type: 'integer', message: i18n.t('compute.text_754') }] },
  'vm_cpu.usage_iowait': { key: 'vm_cpu.usage_iowait', label: i18n.t('monitor.text_128'), unit: '%', rules: [{ max: 100, type: 'integer', message: i18n.t('compute.text_754') }] },
  'vm_cpu.reads': { key: 'vm_cpu.reads', label: i18n.t('monitor.text_129'), unit: 'count' },
  'vm_cpu.writes': { key: 'vm_cpu.writes', label: i18n.t('monitor.text_130'), unit: 'count' },
  'vm_mem.used_percent': { key: 'vm_mem.used_percent', label: i18n.t('compute.text_755'), unit: '%', rules: [{ max: 100, type: 'integer', message: i18n.t('compute.text_754') }] },
  'vm_mem.used': { key: 'vm_mem.used', label: i18n.t('monitor.text_127'), unit: 'G' },
  'vm_netio.bps_recv': { key: 'vm_netio.bps_recv', label: i18n.t('compute.text_756'), unit: 'bps' },
  'vm_netio.bps_sent': { key: 'vm_netio.bps_sent', label: i18n.t('compute.text_757'), unit: 'bps' },
  'vm_diskio.read_bps': { key: 'vm_diskio.read_bps', label: i18n.t('compute.text_758'), unit: 'bps' },
  'vm_diskio.write_bps': { key: 'vm_diskio.write_bps', label: i18n.t('compute.text_759'), unit: 'bps' },
  // KVM宿主机
  'usage_active,usage_idle,usage_user,usage_system,usage_iowait': { key: 'usage_active,usage_idle,usage_user,usage_system,usage_iowait', label: i18n.t('compute.text_760'), unit: '%', rules: [{ max: 100, type: 'integer', message: i18n.t('compute.text_754') }] },
  'load1,load5,load15,load1_pcore,load5_pcore,load15_pcore': { key: 'load1,load5,load15,load1_pcore,load5_pcore,load15_pcore', label: i18n.t('compute.text_761'), unit: '%' },
  used_percent: { key: 'used_percent', label: i18n.t('compute.text_755'), unit: '%', rules: [{ max: 100, type: 'integer', message: i18n.t('compute.text_754') }] },
  'used,free,total': { key: 'used,free,total', label: i18n.t('compute.text_762'), unit: '%', rules: [{ max: 100, type: 'integer', message: i18n.t('compute.text_754') }] },
  // 'used_percent': { key: 'used_percent', label: '磁盘使用率(used_percent)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  // 'used,free,total': { key: 'used,free,total', label: '磁盘使用情况(used,free,total)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  ioutil: { key: 'ioutil', label: i18n.t('compute.text_763'), unit: '%', rules: [{ max: 100, type: 'integer', message: i18n.t('compute.text_754') }] },
  'read_iops,write_iops': { key: 'read_iops,write_iops', label: i18n.t('compute.text_764'), unit: '%' },
  bps_recv: { key: 'bps_recv', label: i18n.t('compute.text_756'), unit: '%' },
  bps_sent: { key: 'bps_sent', label: i18n.t('compute.text_757'), unit: '%' },
  // VMWARE宿主机
  usage_active: { key: 'usage_active', label: i18n.t('compute.text_753'), unit: '%', rules: [{ max: 100, type: 'integer', message: i18n.t('compute.text_754') }] },
  // 'used_percent': { key: 'used_percent', label: '内存使用率(used_percent)', unit: '%', rules: [{ max: 100, type: 'integer', message: '请输入100以内的数值' }] },
  read_bps: { key: 'read_bps', label: i18n.t('compute.text_765'), unit: '%' },
  write_bps: { key: 'write_bps', label: i18n.t('compute.text_766'), unit: '%' },
  // 'bps_recv': { key: 'bps_recv', label: '网络入流量(bps_recv)', unit: '%' },
  // 'bps_sent': { key: 'bps_sent', label: '网络出流量(bps_sent)', unit: '%' },
}

export const TIME_CN = {
  s: i18n.t('compute.text_767'),
  m: i18n.t('compute.text_734'),
  h: i18n.t('compute.text_172'),
}

export const channelMap = {
  email: i18n.t('compute.text_743'),
  moblie: i18n.t('compute.text_768'),
  dingtalk: i18n.t('compute.text_769'),
}
