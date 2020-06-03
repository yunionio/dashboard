export const timeOpts = {
  [`${1}h`]: {
    key: `${1}h`,
    label: '近1小时',
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '1m', label: '1分钟' },
      { key: '5m', label: '5分钟' },
    ],
  },
  [`${3}h`]: {
    key: `${3}h`,
    label: '近3小时',
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '1m', label: '1分钟' },
      { key: '5m', label: '5分钟' },
    ],
  },
  [`${6}h`]: {
    key: `${6}h`,
    label: '近6小时',
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '1m', label: '1分钟' },
      { key: '5m', label: '5分钟' },
      { key: '10m', label: '10分钟' },
    ],
  },
  [`${24}h`]: {
    key: `${24}h`,
    label: '近1天',
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '5m', label: '5分钟' },
      { key: '10m', label: '10分钟' },
      { key: '30m', label: '30分钟' },
      { key: '1h', label: '1小时' },
    ],
  },
  [`${3 * 24}h`]: {
    key: `${3 * 24}h`,
    label: '近3天',
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '5m', label: '5分钟' },
      { key: '10m', label: '10分钟' },
      { key: '30m', label: '30分钟' },
      { key: '1h', label: '1小时' },
    ],
  },
  'custom': {
    key: 'custom',
    hidden: true,
    label: '自定义',
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '5m', label: '5分钟' },
      { key: '10m', label: '10分钟' },
      { key: '30m', label: '30分钟' },
      { key: '1h', label: '1小时' },
      { key: '6h', label: '6小时' },
      { key: '1d', label: '1天' },
    ],
  },
}

export const metricMaps = {
  cpu: {
    key: 'cpu',
    label: '宿主机cpu使用情况',
    metrics: {
      usage_active: {
        key: 'usage_active',
        label: 'cpu使用百分比',
      },
    },
  },
  disk: {
    key: 'disk',
    label: '宿主机磁盘使用情况',
    metrics: {
      used_percent: {
        key: 'used_percent',
        label: '磁盘使用率',
      },
    },
  },
  diskio: {
    key: 'diskio',
    label: '宿主机磁盘读写情况',
  },
  haproxy: {
    key: 'haproxy',
    label: '',
  },
  internal_agent: {
    key: 'internal_agent',
    label: '',
  },
  internal_gather: {
    key: 'internal_gather',
    label: '',
  },
  internal_http_listener: {
    key: 'internal_http_listener',
    label: '',
  },
  internal_write: {
    key: 'internal_write',
    label: '',
  },
  jenkins_node: {
    key: 'jenkins_node',
    label: '',
  },
  kernel: {
    key: 'kernel',
    label: '',
  },
  kernel_vmstat: {
    key: 'kernel_vmstat',
    label: '',
  },
  mem: {
    key: 'mem',
    label: '宿主机内存使用情况',
  },
  net: {
    key: 'net',
    label: '宿主机网络使用情况',
  },
  netstat: {
    key: 'netstat',
    label: '',
  },
  nstat: {
    key: 'nstat',
    label: '',
  },
  ntpq: {
    key: 'ntpq',
    label: '',
  },
  ping: {
    key: 'ping',
    label: '',
  },
  processes: {
    key: 'processes',
    label: '',
  },
  swap: {
    key: 'swap',
    label: '',
  },
  system: {
    key: 'system',
    label: '',
  },
  usage: {
    key: 'usage',
    label: '',
  },
  vm_capacity: {
    key: 'vm_capacity',
    label: '虚拟机中配置使用量',
    metrics: {
      disk: {
        key: 'disk',
        label: '磁盘容量',
      },
      vcpu_count: {
        key: 'vcpu_count',
        label: 'cpu核数',
      },
      vmem_size: {
        key: 'vmem_size',
        label: '内存容量',
      },
    },
  },
  vm_cpu: {
    key: 'vm_cpu',
    label: '虚拟机cpu使用情况',
    metrics: {
      cpu_count: {
        key: 'cpu_count',
        label: 'cpu核数',
      },
      usage_active: {
        key: 'usage_active',
        label: 'cpu使用率',
      },
    },
  },
  vm_diskio: {
    key: 'vm_diskio',
    label: '虚拟机磁盘读写情况',
  },
  vm_mem: {
    key: 'vm_mem',
    label: '虚拟机内存使用情况',
  },
  vm_netio: {
    key: 'vm_netio',
    label: '虚拟机网络流量情况',
  },
}

export const DATABASE = 'telegraf'

export const tableColumnMaps = {
  vm_name: {
    title: '名称',
    field: 'vm_name',
  },
  vm_ip: {
    title: 'IP',
    field: 'vm_ip',
  },
  host: {
    title: '宿主机',
    field: 'host',
  },
  cloudregion: {
    title: '区域',
    field: 'cloudregion',
  },
  zone: {
    title: '区域',
    field: 'zone',
  },
}
