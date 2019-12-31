// import { metricItems } from '@Compute/views/node-alert/constants'

export const GAUGEMSG = [
  {
    label: '系统负载',
    sql: {
      key: 'load1_pcore',
      db: 'system',
    },
    option: 'system',
    max: 4, // 最大长度
  },
  {
    label: '内存使用率',
    option: 'mem',
    sql: {
      key: 'used_percent',
      db: 'mem',
    },
  },
  {
    label: '磁盘IO使用率',
    option: 'diskio',
    sql: {
      key: 'ioutil',
      db: 'diskio',
    },
  },
  {
    label: '磁盘空间使用率',
    option: 'disk',
    sql: {
      key: 'used_percent',
      db: 'disk',
    },
  },
  {
    label: '网卡入带宽使用率',
    option: 'net_in',
    sql: {
      key: 'if_in_percent',
      db: 'net',
    },
  },
  {
    label: '网卡出带宽使用率',
    option: 'net_out',
    sql: {
      key: 'if_out_percent',
      db: 'net',
    },
  },
]

export const HOST_TOP5 = {
  isKvm: [
    {
      name: 'cpu',
      label: 'CPU使用率',
      seleteItem: 'cpu_usage_pcore',
      fromItem: 'vm_cpu',
      unit: '%',
    },
    {
      name: 'netio',
      label: '网络入流量',
      seleteItem: 'bps_recv',
      fromItem: 'vm_netio',
      unit: 'bps',
    },
    {
      name: 'netio',
      label: '网络出流量',
      seleteItem: 'bps_sent',
      fromItem: 'vm_netio',
      unit: 'bps',
    },
    {
      name: 'diskio',
      label: '磁盘读速率',
      seleteItem: 'read_bps',
      fromItem: 'vm_diskio',
      unit: 'bps',
    },
    {
      name: 'diskio',
      label: '磁盘写速率',
      seleteItem: 'write_bps',
      fromItem: 'vm_diskio',
      unit: 'bps',
    },
  ],
  noKvm: [
    {
      name: 'cpu',
      label: 'CPU使用率',
      seleteItem: 'usage_active',
      fromItem: 'vm_cpu',
    },
    {
      name: 'netio',
      label: '网络入流量',
      seleteItem: 'bps_recv',
      fromItem: 'vm_netio',
      unit: 'bps',
    },
    {
      name: 'netio',
      label: '网络出流量',
      seleteItem: 'bps_sent',
      fromItem: 'vm_netio',
      unit: 'bps',
    },
    {
      name: 'diskio',
      label: '磁盘读速率',
      seleteItem: 'read_bps',
      fromItem: 'vm_diskio',
      unit: 'bps',
    },
    {
      name: 'diskio',
      label: '磁盘写速率',
      seleteItem: 'write_bps',
      fromItem: 'vm_diskio',
      unit: 'bps',
    },
  ],
}

// kvm 型宿主机监控数据
export const KVM_MONITOR_OPTS = [
  {
    name: 'cpu',
    label: 'CPU使用率',
    seleteItem: 'usage_active,usage_idle,usage_user,usage_system,usage_iowait',
    fromItem: 'cpu',
    as: 'CPU使用率,CPU空闲率,用户空间占用CPU,内核空间占用CPU,等待输入输出的CPU时间占比',
    unit: '%',
    transfer: 1,
    // metric: metricItems['usage_active,usage_idle,usage_user,usage_system,usage_iowait'].key, // 报警指标
  },
  {
    name: 'system',
    label: '系统负载情况',
    seleteItem: 'load1,load5,load15,load1_pcore,load5_pcore,load15_pcore',
    as: '系统1分钟平均负载,系统5分钟平均负载,系统15分钟平均负载,平均每个CPU核的系统1分钟平均负载,平均每个CPU核的系统5分钟平均负载,平均每个CPU核的系统15分钟平均负载',
    fromItem: 'system',
    unit: '',
    transfer: 1,
    // metric: metricItems['load1,load5,load15,load1_pcore,load5_pcore,load15_pcore'].key, // 报警指标
  },
  {
    name: 'mem',
    label: '内存使用率',
    seleteItem: 'used_percent',
    as: '内存使用率',
    fromItem: 'mem',
    unit: '%',
    transfer: 1,
    // metric: metricItems['used_percent'].key, // 报警指标
  },
  {
    name: 'memCondition',
    label: '内存使用情况',
    seleteItem: 'used,free,total',
    as: '内存使用量,内存剩余量,内存总量',
    fromItem: 'mem',
    unit: 'B',
    transfer: 1024,
    // metric: metricItems['used,free,total'].key, // 报警指标
  },
  {
    name: 'disk',
    label: '磁盘使用率',
    seleteItem: 'used_percent',
    as: '磁盘使用率',
    fromItem: 'disk',
    unit: '%',
    transfer: 1,
    // metric: metricItems['used_percent'].key, // 报警指标
  },
  {
    name: 'diskCondition',
    label: '磁盘使用情况',
    seleteItem: 'used,free,total',
    as: '磁盘使用量,磁盘剩余量,磁盘总量',
    fromItem: 'disk',
    unit: 'B',
    transfer: 1024,
    // metric: metricItems['used,free,total'].key, // 报警指标
  },
  {
    name: 'disk',
    label: '磁盘IO使用率',
    seleteItem: 'ioutil',
    as: '磁盘IO使用率',
    fromItem: 'diskio',
    unit: '%',
    transfer: 1,
    // metric: metricItems['ioutil'].key, // 报警指标
  },
  {
    name: 'disk',
    label: '磁盘IOPS',
    seleteItem: 'read_iops,write_iops',
    as: '磁盘当前每秒平均读IO次数,磁盘当前每秒平均写IO次数',
    fromItem: 'diskio',
    unit: 'iops',
    transfer: 1,
    // metric: metricItems['read_iops,write_iops'].key, // 报警指标
  },
  {
    name: 'bps_recv',
    label: '网络入流量',
    seleteItem: 'bps_recv',
    as: '网络入流量',
    fromItem: 'net',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['bps_recv'].key, // 报警指标
  },
  {
    name: 'bps_sent',
    label: '网络出流量',
    seleteItem: 'bps_sent',
    as: '网络出流量',
    fromItem: 'net',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['bps_sent'].key, // 报警指标
  },
]

// vmware 型宿主机监控数据
export const VMWARE_MONITOR_OPTS = [
  {
    name: 'cpu',
    label: 'CPU使用率',
    as: 'CPU使用率',
    seleteItem: 'usage_active',
    fromItem: 'cpu',
    unit: '%',
    transfer: 1,
    // metric: metricItems['usage_active'].key, // 报警指标
  },
  {
    name: 'mem',
    label: '内存使用率',
    as: '内存使用率',
    seleteItem: 'used_percent',
    fromItem: 'mem',
    unit: '%',
    transfer: 1,
    // metric: metricItems['used_percent'].key, // 报警指标
  },
  {
    name: 'read_bps',
    label: '磁盘读取速率',
    as: '磁盘读取速率',
    seleteItem: 'read_bps',
    fromItem: 'diskio',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['read_bps'].key, // 报警指标
  },
  {
    name: 'write_bps',
    label: '磁盘写入速率',
    as: '磁盘写入速率',
    seleteItem: 'write_bps',
    fromItem: 'diskio',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['write_bps'].key, // 报警指标
  },
  {
    name: 'bps_recv',
    label: '网络入流量',
    as: '网络入流量',
    seleteItem: 'bps_recv',
    fromItem: 'net',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['bps_recv'].key, // 报警指标
  },
  {
    name: 'bps_sent',
    label: '网络出流量',
    as: '网络出流量',
    seleteItem: 'bps_sent',
    fromItem: 'net',
    unit: 'bps',
    transfer: 1024,
    // metric: metricItems['bps_sent'].key, // 报警指标
  },
]
