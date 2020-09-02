/* eslint-disable quote-props */
import i18n from '@/locales'
import BrandIcon from '@/sections/BrandIcon'

export const timeOpts = {
  [`${1}h`]: {
    key: `${1}h`,
    label: i18n.t('monitor.text00001'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '1m', label: i18n.t('monitor.text00007') },
      { key: '5m', label: i18n.t('monitor.text00008') },
    ],
  },
  [`${3}h`]: {
    key: `${3}h`,
    label: i18n.t('monitor.text00002'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '1m', label: i18n.t('monitor.text00007') },
      { key: '5m', label: i18n.t('monitor.text00008') },
    ],
  },
  [`${6}h`]: {
    key: `${6}h`,
    label: i18n.t('monitor.text00003'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '1m', label: i18n.t('monitor.text00007') },
      { key: '5m', label: i18n.t('monitor.text00008') },
      { key: '10m', label: i18n.t('monitor.text00009') },
    ],
  },
  [`${24}h`]: {
    key: `${24}h`,
    label: i18n.t('monitor.text00004'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '5m', label: i18n.t('monitor.text00008') },
      { key: '10m', label: i18n.t('monitor.text00009') },
      { key: '30m', label: i18n.t('monitor.text00010') },
      { key: '1h', label: i18n.t('monitor.text00011') },
    ],
  },
  [`${3 * 24}h`]: {
    key: `${3 * 24}h`,
    label: i18n.t('monitor.text00005'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '5m', label: i18n.t('monitor.text00008') },
      { key: '10m', label: i18n.t('monitor.text00009') },
      { key: '30m', label: i18n.t('monitor.text00010') },
      { key: '1h', label: i18n.t('monitor.text00011') },
    ],
  },
  custom: {
    key: 'custom',
    hidden: true,
    label: i18n.t('monitor.text00006'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '5m', label: i18n.t('monitor.text00008') },
      { key: '10m', label: i18n.t('monitor.text00009') },
      { key: '30m', label: i18n.t('monitor.text00010') },
      { key: '1h', label: i18n.t('monitor.text00011') },
      { key: '6h', label: i18n.t('monitor.text00012') },
      { key: '24h', label: i18n.t('monitor.text00013') },
    ],
  },
}

export const metricMaps = {
  cpu: {
    key: 'cpu',
    label: i18n.t('monitor.metrics_cpu'),
    metrics: {
      usage_active: {
        key: 'usage_active',
        label: i18n.t('monitor.metrics_cpu_usage_active'),
      },
    },
  },
  disk: {
    key: 'disk',
    label: i18n.t('monitor.metrics_disk'),
    metrics: {
      used_percent: {
        key: 'used_percent',
        label: i18n.t('monitor.metrics_disk_used_percent'),
      },
    },
  },
  diskio: {
    key: 'diskio',
    label: i18n.t('monitor.metrics_disk_used_percent'),
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
    label: i18n.t('monitor.metrics_mem'),
  },
  net: {
    key: 'net',
    label: i18n.t('monitor.metrics_net'),
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
    label: i18n.t('monitor.metrics_vm_capacity'),
    metrics: {
      disk: {
        key: 'disk',
        label: i18n.t('monitor.metrics_vm_capacity_disk'),
      },
      vcpu_count: {
        key: 'vcpu_count',
        label: i18n.t('monitor.metrics_vm_capacity_vcpu_count'),
      },
      vmem_size: {
        key: 'vmem_size',
        label: i18n.t('monitor.metrics_vm_capacity_vmem_size'),
      },
    },
  },
  vm_cpu: {
    key: 'vm_cpu',
    label: i18n.t('monitor.metrics_vm_cpu'),
    metrics: {
      cpu_count: {
        key: 'cpu_count',
        label: i18n.t('monitor.metrics_vm_cpu_cpu_count'),
      },
      usage_active: {
        key: 'usage_active',
        label: i18n.t('monitor.metrics_vm_cpu_usage_active'),
      },
    },
  },
  vm_diskio: {
    key: 'vm_diskio',
    label: i18n.t('monitor.metrics_vm_diskio'),
  },
  vm_mem: {
    key: 'vm_mem',
    label: i18n.t('monitor.metrics_vm_mem'),
  },
  vm_netio: {
    key: 'vm_netio',
    label: i18n.t('monitor.metrics_vm_netio'),
  },
}

// 顺序决定在 tableColumn 的顺序
export const tableColumnMaps = {
  __metric: {
    title: i18n.t('monitor.monitor_metric'),
    field: '__metric',
  },
  vm_name: {
    title: i18n.t('common.name'),
    field: 'vm_name',
  },
  vm_ip: {
    title: 'IP',
    field: 'vm_ip',
  },
  host: {
    title: i18n.t('dictionary.host'),
    field: 'host',
  },
  path: {
    title: i18n.t('monitor.path'),
    field: 'path',
  },
  host_ip: {
    title: `${i18n.t('dictionary.host')}IP`,
    field: 'host_ip',
  },
  cloudaccount_name: {
    title: i18n.t('common_295'),
    field: 'cloudaccount_name',
  },
  brand: {
    title: i18n.t('common.brand'),
    field: 'brand',
    slots: {
      default: ({ row }, h) => {
        if (row.brand) {
          return [<BrandIcon name={ row.brand } />]
        }
        return '-'
      },
    },
  },
}

// 报警通知方式，配合 a-checkbox-group 用 value 而非 key
export const channelMaps = {
  webconsole: { value: 'webconsole', label: i18n.t('dictionary.infos'), disabled: true, sort: 0 },
  email: { value: 'email', label: i18n.t('common.email'), sort: 1 },
  mobile: { value: 'mobile', label: i18n.t('helm.text_49'), sort: 2 },
  workwx: { value: 'workwx', label: i18n.t('common.workwx'), sort: 3 },
  dingtalk: { value: 'dingtalk', label: i18n.t('common.dingtalk'), sort: 4 },
  feishu: { value: 'feishu', label: i18n.t('common.feishu'), sort: 5 },
  'feishu-robot': { value: 'feishu', label: i18n.t('common.feishu_robot'), sort: 6 },
  'workwx-robot': { value: 'workwx-robot', label: i18n.t('common_596'), sort: 7 },
  'dingtalk-robot': { value: 'dingtalk-robot', label: i18n.t('system.text_303'), sort: 8 },
}

export const alertStrategyMaps = {
  avg: i18n.t('monitor.avg'),
  max: i18n.t('monitor.max'),
  min: i18n.t('monitor.min'),
}

export const preiodMaps = {
  '5m': { key: '5m', label: i18n.t('monitor.text00018') },
  '10m': { key: '10m', label: i18n.t('monitor.text00019') },
  '15m': { key: '15m', label: i18n.t('monitor.text00020') },
  '30m': { key: '30m', label: i18n.t('monitor.text00021') },
  '60m': { key: '60m', label: i18n.t('monitor.text00022') },
  '180m': { key: '180m', label: i18n.t('monitor.text00023') },
}

export const levelMaps = {
  normal: {
    color: 'cyan',
    key: 'normal',
    label: i18n.t('monitor.normal'),
  },
  important: {
    color: 'pink',
    key: 'important',
    label: i18n.t('monitor.important'),
  },
  fatal: {
    color: 'red',
    key: 'fatal',
    label: i18n.t('monitor.fatal'),
  },
}

export const metric_zh = {
  'CPU idle rate per core': i18n.t('monitor_metric_1'),
  'CPU usage per core': i18n.t('monitor_metric_2'),
  'CPU user state time': i18n.t('monitor_metric_3'),
  'CPU system state time': i18n.t('monitor_metric_4'),
  'CPU active state utilization rate': i18n.t('monitor_metric_5'),
  'CPU guest usage': i18n.t('monitor_metric_6'),
  'CPU guest_ Nice usage': i18n.t('monitor_metric_7'),
  'CPU idle state utilization rate': i18n.t('monitor_metric_8'),
  'CPU IO usage': i18n.t('monitor_metric_9'),
  'CPU IRQ usage': i18n.t('monitor_metric_10'),
  'CPU priority switch utilization': i18n.t('monitor_metric_11'),
  'CPU softirq usage': i18n.t('monitor_metric_12'),
  'Utilization rate of CPU steel': i18n.t('monitor_metric_13'),
  'CPU system state utilization rate': i18n.t('monitor_metric_14'),
  'CPU user mode utilization rate': i18n.t('monitor_metric_15'),
  'Free space size': i18n.t('monitor_metric_16'),
  'Available inode': i18n.t('monitor_metric_17'),
  'Total inodes': i18n.t('monitor_metric_18'),
  'Number of inodes used': i18n.t('monitor_metric_19'),
  'Total disk size': i18n.t('monitor_metric_20'),
  'Used disk size': i18n.t('monitor_metric_21'),
  'Percentage of used disks': i18n.t('monitor_metric_22'),
  'Number of reads': i18n.t('monitor_metric_23'),
  'Number of writes': i18n.t('monitor_metric_24'),
  'Bytes read': i18n.t('monitor_metric_25'),
  'Time to wait for read': i18n.t('monitor_metric_26'),
  'I / O request queuing time': i18n.t('monitor_metric_27'),
  'I / O request waiting time': i18n.t('monitor_metric_28'),
  'Number of I / O requests issued but not yet completed': i18n.t('monitor_metric_29'),
  'Available memory rate': i18n.t('monitor_metric_30'),
  'Buffer memory': i18n.t('monitor_metric_31'),
  'Cache memory': i18n.t('monitor_metric_32'),
  'Free memory': i18n.t('monitor_metric_33'),
  'Number of kernel caches': i18n.t('monitor_metric_34'),
  'The total number of bytes sent by the network interface': i18n.t('monitor_metric_35'),
  'The total number of bytes received by the network interface': i18n.t('monitor_metric_36'),
  'The total number of packets sent by the network interface': i18n.t('monitor_metric_37'),
  'The total number of receive errors detected by the network interface': i18n.t('monitor_metric_38'),
  'The total number of transmission errors detected by the network interface': i18n.t('monitor_metric_39'),
  'The total number of received packets dropped by the network interface': i18n.t('monitor_metric_40'),
  'System disk total read BPS': i18n.t('monitor_metric_41'),
  'System disk read IOPs': i18n.t('monitor_metric_42'),
  'Virtual memory consumption': i18n.t('monitor_metric_43'),
  'Actual use of physical memory': i18n.t('monitor_metric_44'),
  'Object storage latency': i18n.t('monitor_metric_45'),
  'Request average E2E delay': i18n.t('monitor_metric_46'),
  'Object storage network traffic': i18n.t('monitor_metric_47'),
  'Receive byte': i18n.t('monitor_metric_48'),
  'Object store request': i18n.t('monitor_metric_49'),
  'Connection usage': i18n.t('db.text_18'),
  'Average memory usage': i18n.t('monitor_metric_50'),
  'Received traffic per second': i18n.t('monitor_metric_51'),
  'Send traffic per second': i18n.t('monitor_metric_52'),
  'Number of commands processed per second': i18n.t('monitor_metric_53'),
  'Number of cache keys': i18n.t('monitor_metric_54'),
  'Data node memory usage': i18n.t('monitor_metric_55'),
  'Disk traffic and timing': i18n.t('monitor_metric_56'),
  'Guest memory': i18n.t('monitor_metric_57'),
  'Redis operator': i18n.t('monitor_metric_58'),
  'Disk usage': i18n.t('monitor_metric_59'),
  'Network interface and protocol usage': i18n.t('monitor_metric_60'),
  'Guest CPU usage': i18n.t('monitor_metric_61'),
  'Guest disk traffic': i18n.t('monitor_metric_62'),
  'Redis keys': i18n.t('monitor_metric_63'),
  'Redis data memory': i18n.t('monitor_metric_64'),
  'Rds connect': i18n.t('monitor_metric_65'),
  'Rds disk usage': i18n.t('monitor_metric_66'),
  'Rds network traffic': i18n.t('monitor_metric_67'),
  'Redis connect': i18n.t('monitor_metric_68'),
  'Rds memory': i18n.t('monitor_metric_69'),
  'Redis network traffic': i18n.t('monitor_metric_70'),
  'Redis memory': i18n.t('monitor_metric_71'),
  'Redis CPU usage': i18n.t('monitor_metric_72'),
  'Memory': i18n.t('monitor_metric_73'),
  'CPU usage': i18n.t('monitor_metric_74'),
  'Rds CPU usage': i18n.t('monitor_metric_75'),
  'Cloud account balance': i18n.t('monitor_metric_76'),
  'balance': i18n.t('monitor_metric_77'),
  'Disk read rate': i18n.t('monitor_metric_79'),
  'Disk write rate': i18n.t('monitor_metric_80'),
  'Disk read operate rate': i18n.t('monitor_metric_81'),
  'Disk write operate rate': i18n.t('monitor_metric_82'),
  'Bytes write': i18n.t('monitor_metric_83'),
  'Time to wait for write': i18n.t('monitor_metric_84'),
  'Used memory rate': i18n.t('monitor_metric_85'),
  'Used memory': i18n.t('monitor_metric_86'),
  'Available memory': i18n.t('monitor_metric_87'),
  'The amount of active memory': i18n.t('monitor_metric_88'),
  'The amount of inactive memory': i18n.t('monitor_metric_89'),
  'Total memory': i18n.t('monitor_metric_90'),
  'The total number of packets received by the network interface': i18n.t('monitor_metric_91'),
  'The total number of transmission packets dropped by the network interface': i18n.t('monitor_metric_92'),
  'CPU utilization rate per core': i18n.t('monitor_metric_93'),
  'The number of threads used by the process': i18n.t('monitor_metric_94'),
}
