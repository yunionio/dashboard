import { metricItems } from '@Compute/views/node-alert/constants'
import i18n from '@/locales'

// 磁盘使用率
const DISK_USED_PERCENT = {
  name: 'disk',
  label: i18n.t('compute.text_533'),
  seleteItem: 'used_percent',
  as: i18n.t('compute.text_533'),
  groupBy: ['device', 'path', 'fstype'],
  fromItem: 'agent_disk',
  unit: '%',
  transfer: 1,
  metric: metricItems.used_percent.key,
}

// 内存使用率 基础监控
const BASIC_MEM_USED_PERCENT = {
  name: 'mem',
  label: i18n.t('compute.text_518'),
  seleteItem: 'used_percent',
  fromItem: 'vm_mem',
  unit: '%',
  transfer: 1,
  metric: metricItems['vm_mem.used_percent'].key,
}

// 内存使用率 agent监控
const MEM_USED_PERCENT = {
  name: 'mem',
  label: i18n.t('compute.text_518'),
  seleteItem: 'used_percent',
  fromItem: 'agent_mem',
  unit: '%',
  transfer: 1,
  metric: metricItems['vm_mem.used_percent'].key,
}

// 已使用内存
const MEM_USED = {
  name: 'mem',
  label: i18n.t('monitor.text_127'),
  seleteItem: 'used',
  fromItem: 'agent_mem',
  unit: 'G',
  transfer: 1024,
  metric: metricItems['vm_mem.used'].key,
}

// CPU使用率
const CPU_USED_PERCENT = {
  name: 'cpu',
  label: i18n.t('compute.text_523'),
  seleteItem: 'usage_active',
  fromItem: 'agent_cpu',
  unit: '%',
  transfer: 1,
  metric: 'agent_cpu.usage_active',
}

// CPU IO 使用率
const CPU_IO_USED_PERCENT = {
  name: 'cpu',
  label: i18n.t('monitor.text_128'),
  seleteItem: 'usage_iowait',
  fromItem: 'agent_cpu',
  unit: '%',
  transfer: 1,
  metric: metricItems['vm_cpu.usage_iowait'].key,
}

// 磁盘读取次数
const DISK_READ_NUM = {
  name: 'cpu',
  label: i18n.t('monitor.text_129'),
  seleteItem: 'reads',
  fromItem: 'agent_diskio',
  unit: ' count',
  transfer: 1,
  metric: metricItems['vm_cpu.reads'].key,
}

// 磁盘写入次数
const DISK_WRITE_NUM = {
  name: 'cpu',
  label: i18n.t('monitor.text_130'),
  seleteItem: 'writes',
  fromItem: 'agent_diskio',
  unit: ' count',
  transfer: 1,
  metric: metricItems['vm_cpu.writes'].key,
}

// CPU每核使用率
// const CPU_USED_PERCENT_PER_C = {
//   name: 'cpu',
//   label: i18n.t('monitor.text_123'),
//   seleteItem: 'usage_active',
//   fromItem: 'agent_cpu',
//   unit: '%',
//   transfer: 1,
//   metric: metricItems['vm_cpu.usage_active'].key,
// }

// CPU进程下线程数
// const CPU_THREAD_NUM_UNDER_PROCESS = {
//   name: 'cpu',
//   label: i18n.t('monitor.text_124'),
//   seleteItem: 'usage_active',
//   fromItem: 'agent_cpu',
//   unit: '%',
//   transfer: 1,
//   metric: metricItems['vm_cpu.usage_active'].key,
// }

// 磁盘读速度
const DISK_IO_READ_RATES = {
  name: 'diskio',
  label: i18n.t('compute.text_526'),
  seleteItem: 'read_bps',
  fromItem: 'agent_diskio',
  groupBy: ['name'],
  unit: 'bps',
  transfer: 1024,
  metric: 'agent_diskio.read_bps',
}

// 磁盘写速度
const DISK_IO_WRITE_RATES = {
  name: 'diskio',
  label: i18n.t('compute.text_527'),
  seleteItem: 'write_bps',
  fromItem: 'agent_diskio',
  groupBy: ['name'],
  unit: 'bps',
  transfer: 1024,
  metric: 'agent_diskio.read_bps',
}

// 网络每秒发送字节数
const NET_SEND_BYTE_PER_SECEND = {
  name: 'net',
  label: i18n.t('monitor.text_131'),
  seleteItem: 'bps_sent',
  fromItem: 'agent_net',
  // groupBy: ['name'],
  unit: 'bps',
  transfer: 1024,
  metric: 'vm_net.bps_sent',
}

// 网络每秒接受字节数
const NET_RECV_BYTE_PER_SECEND = {
  name: 'net',
  label: i18n.t('monitor.text_132'),
  seleteItem: 'bps_recv',
  fromItem: 'agent_net',
  // groupBy: ['name'],
  unit: 'bps',
  transfer: 1024,
  metric: 'vm_net.bps_recv',
}

// 网络接口发送数据包总数
const NET_SEND_PACKETS_NUM = {
  name: 'net',
  label: i18n.t('monitor.text_133'),
  seleteItem: 'packets_sent',
  fromItem: 'agent_net',
  unit: 'count',
  transfer: 1,
  metric: 'vm_net.packets_sent',
}

// 网络接口接收数据包总数
const NET_RECV_PACKETS_NUM = {
  name: 'net',
  label: i18n.t('monitor.text_134'),
  seleteItem: 'packets_recv',
  fromItem: 'agent_net',
  unit: 'count',
  transfer: 1,
  metric: 'vm_net.packets_recv',
}

// 网络接口丢失数据包总数
const NET_LOST_PACKETS_NUM = {
  name: 'mem',
  label: i18n.t('monitor.text_135'),
  seleteItem: 'drop_out',
  fromItem: 'agent_net',
  unit: 'count',
  transfer: 1,
  metric: 'vm_net.drop_out',
}

// 磁盘读流量
// const DISK_NET_IO_READ = {
//   name: 'mem',
//   label: i18n.t('monitor.text_125'),
//   seleteItem: 'read_bps',
//   fromItem: 'agent_diskio',
//   groupBy: ['name'],
//   unit: 'bps',
//   transfer: 1024,
//   metric: metricItems['vm_diskio.read_bps'].key,
// }

// 磁盘写流量
// const DISK_NET_IO_WRITE = {
//   name: 'mem',
//   label: i18n.t('monitor.text_126'),
//   seleteItem: 'write_bps',
//   fromItem: 'agent_diskio',
//   groupBy: ['name'],
//   unit: 'bps',
//   transfer: 1024,
//   metric: metricItems['vm_diskio.write_bps'].key,
// }

// 网络入流量
// const NET_RECV_BPS = {
//   name: 'net',
//   label: i18n.t('compute.text_524'),
//   seleteItem: 'bps_recv',
//   fromItem: 'agent_net',
//   groupBy: ['interface'],
//   unit: 'bps',
//   transfer: 1024,
// }

// 网络出流量
// const NET_SENT_BPS = {
//   name: 'net',
//   label: i18n.t('compute.text_525'),
//   seleteItem: 'bps_sent',
//   fromItem: 'agent_net',
//   groupBy: ['interface'],
//   unit: 'bps',
//   transfer: 1024,
// }

const COND_AND = 'AND'
// const COND_OR = 'OR'
// const COND_NULL = ''

function newWhereField (key, operator, val, cond) {
  return {
    key: key,
    operator: operator,
    value: val,
    condition: cond,
  }
}

export const AGENT_MONITOR = [
  CPU_USED_PERCENT,
  MEM_USED_PERCENT,
  MEM_USED,
  DISK_USED_PERCENT,
  CPU_IO_USED_PERCENT,
  DISK_IO_READ_RATES,
  DISK_IO_WRITE_RATES,
  DISK_READ_NUM,
  DISK_WRITE_NUM,
  NET_SEND_BYTE_PER_SECEND,
  NET_RECV_BYTE_PER_SECEND,
  NET_SEND_PACKETS_NUM,
  NET_RECV_PACKETS_NUM,
  NET_LOST_PACKETS_NUM,
]

// CPU温度
const TEMPERATURE_CPU_INPUT = {
  name: 'temp_input',
  label: i18n.t('compute.monitor.temperature.cpu'),
  seleteItem: 'temp_input',
  fromItem: 'agent_sensors',
  // groupBy: ['chip', 'feature'],
  groupBy: ['chip'],
  where: [
    newWhereField('chip', '=~', '/^coretemp-isa-/', COND_AND),
  ],
  unit: '℃',
  transfer: 1,
  metric: 'temp',
}

// 磁盘温度
const TEMPERATURE_DISK_INPUT = {
  name: 'temp_c',
  label: i18n.t('compute.monitor.temperature.disk'),
  seleteItem: 'temp_c',
  fromItem: 'agent_smart_device',
  groupBy: ['device', 'device_type'],
  where: [
    newWhereField('temp_c', '>', '0', COND_AND),
  ],
  unit: '℃',
  transfer: 1,
  metric: 'temp',
}

// PCI接口温度
const TEMPERATURE_PCI_INPUT = {
  name: 'temp_input',
  label: i18n.t('compute.monitor.temperature.pci'),
  seleteItem: 'temp_input',
  fromItem: 'agent_sensors',
  // groupBy: ['chip', 'feature'],
  groupBy: ['chip'],
  where: [
    newWhereField('chip', '=~', '/.+-pci-.+/', COND_AND),
  ],
  unit: '℃',
  transfer: 1,
  metric: 'temp',
  noDataHide: true,
}

// 其他设备温度
const TEMPERATURE_VIRTUAL_INPUT = {
  name: 'temp_input',
  label: i18n.t('compute.monitor.temperature.other_device'),
  seleteItem: 'temp_input',
  fromItem: 'agent_sensors',
  // groupBy: ['chip', 'feature'],
  groupBy: ['chip'],
  where: [
    newWhereField('chip', '=~', '/.+-virtual-.+/', COND_AND),
  ],
  unit: '℃',
  transfer: 1,
  metric: 'temp',
  noDataHide: true,
}

export const AGENT_TEMPERATURE_MONITOR = [
  TEMPERATURE_CPU_INPUT,
  TEMPERATURE_DISK_INPUT,
  TEMPERATURE_PCI_INPUT,
  TEMPERATURE_VIRTUAL_INPUT,
]

// OneCloud 虚拟机监控数据
export const ONECLOUD_MONITOR = [
  {
    name: 'cpu',
    label: i18n.t('compute.text_523'),
    seleteItem: 'usage_active',
    fromItem: 'vm_cpu',
    unit: '%',
    transfer: 1,
    metric: metricItems['vm_cpu.usage_active'].key, // 报警指标
  },
  // 内存使用率
  BASIC_MEM_USED_PERCENT,
  // 网络入流量
  {
    name: 'netio',
    label: i18n.t('compute.text_524'),
    seleteItem: 'bps_recv',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_netio.bps_recv'].key,
  },
  // 网络出流量
  {
    name: 'netio',
    label: i18n.t('compute.text_525'),
    seleteItem: 'bps_sent',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_netio.bps_sent'].key,
  },
  // 磁盘读速度
  {
    name: 'diskio',
    label: i18n.t('compute.text_526'),
    seleteItem: 'read_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_diskio.read_bps'].key,
  },
  // 磁盘写速度
  {
    name: 'diskio',
    label: i18n.t('compute.text_527'),
    seleteItem: 'write_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_diskio.write_bps'].key,
  },
]

// vmware 虚拟机监控数据
export const VMWARE_MONITOR = [
  {
    name: 'cpu',
    label: i18n.t('compute.text_523'),
    seleteItem: 'usage_active',
    fromItem: 'vm_cpu',
    unit: '%',
    transfer: 1,
    metric: metricItems['vm_cpu.usage_active'].key,
  },
  BASIC_MEM_USED_PERCENT,
  {
    name: 'netio',
    label: i18n.t('compute.text_524'),
    seleteItem: 'bps_recv',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_netio.bps_recv'].key,
  },
  {
    name: 'netio',
    label: i18n.t('compute.text_525'),
    seleteItem: 'bps_sent',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_netio.bps_sent'].key,
  },
  {
    name: 'diskio',
    label: i18n.t('compute.text_526'),
    seleteItem: 'read_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_diskio.read_bps'].key,
  },
  {
    name: 'diskio',
    label: i18n.t('compute.text_527'),
    seleteItem: 'write_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_diskio.write_bps'].key,
  },
]

// 除了 kvm、vmware 虚拟机监控数据
export const OTHER_MONITOR = [
  {
    name: 'cpu',
    label: i18n.t('compute.text_523'),
    seleteItem: 'usage_active',
    transfer: 1,
    fromItem: 'vm_cpu',
    unit: '%',
    metric: metricItems['vm_cpu.usage_active'].key,
  },
  BASIC_MEM_USED_PERCENT,
  {
    name: 'netio',
    label: i18n.t('compute.text_524'),
    seleteItem: 'bps_recv',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_netio.bps_recv'].key,
  },
  {
    name: 'netio',
    label: i18n.t('compute.text_525'),
    seleteItem: 'bps_sent',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_netio.bps_sent'].key,
  },
  {
    name: 'diskio',
    label: i18n.t('compute.text_526'),
    seleteItem: 'read_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_diskio.read_bps'].key,
  },
  {
    name: 'diskio',
    label: i18n.t('compute.text_527'),
    seleteItem: 'write_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
    metric: metricItems['vm_diskio.write_bps'].key,
  },
]

// 宿主机cpu使用率
const HOST_CPU_USED_PERCENT = {
  name: 'cpu',
  label: i18n.t('compute.text_523'),
  seleteItem: 'usage_active',
  fromItem: 'cpu',
  unit: '%',
  transfer: 1,
  metric: 'cpu.usage_active',
}

// 宿主机内存使用率
const HOST_MEM_USED_PERCENT = {
  name: 'mem',
  label: i18n.t('compute.text_518'),
  seleteItem: 'used_percent',
  fromItem: 'mem',
  unit: '%',
  transfer: 1,
  metric: 'mem.used_percent',
}

// 宿主机已使用内存
const HOST_MEM_USED = {
  name: 'mem',
  label: i18n.t('monitor.text_127'),
  seleteItem: 'used',
  fromItem: 'mem',
  unit: 'G',
  transfer: 1024,
  metric: 'mem.used',
}

// 宿主机磁盘使用率
const HOST_DISK_USED_PERCENT = {
  name: 'disk',
  label: i18n.t('compute.text_533'),
  seleteItem: 'used_percent',
  as: i18n.t('compute.text_533'),
  groupBy: ['device', 'path', 'fstype'],
  fromItem: 'disk',
  unit: '%',
  transfer: 1,
  metric: metricItems.used_percent.key,
}

// 宿主机 CPU IO 使用率
const HOST_CPU_IO_USED_PERCENT = {
  name: 'cpu',
  label: i18n.t('monitor.text_128'),
  seleteItem: 'usage_iowait',
  fromItem: 'cpu',
  unit: '%',
  transfer: 1,
  metric: 'cpu.usage_iowait',
}

// 宿主机 磁盘读速度
const HOST_DISK_IO_READ_RATES = {
  name: 'diskio',
  label: i18n.t('compute.text_526'),
  seleteItem: 'read_bps',
  fromItem: 'diskio',
  groupBy: ['name'],
  unit: 'bps',
  transfer: 1024,
  metric: metricItems.read_bps.key,
}

// 宿主机 磁盘写速度
const HOST_DISK_IO_WRITE_RATES = {
  name: 'diskio',
  label: i18n.t('compute.text_527'),
  seleteItem: 'write_bps',
  fromItem: 'diskio',
  groupBy: ['name'],
  unit: 'bps',
  transfer: 1024,
  metric: metricItems.write_bps.key,
}

// 宿主机 磁盘读取次数
const HOST_DISK_READ_NUM = {
  name: 'cpu',
  label: i18n.t('monitor.text_129'),
  seleteItem: 'reads',
  fromItem: 'diskio',
  unit: ' count',
  transfer: 1,
  metric: 'cpu.reads',
}

// 宿主机 磁盘写入次数
const HOST_DISK_WRITE_NUM = {
  name: 'cpu',
  label: i18n.t('monitor.text_130'),
  seleteItem: 'writes',
  fromItem: 'diskio',
  unit: ' count',
  transfer: 1,
  metric: 'cpu.writes',
}

// 宿主机 网络每秒发送字节数
const HOST_NET_SEND_BYTE_PER_SECEND = {
  name: 'net',
  label: i18n.t('monitor.text_131'),
  seleteItem: 'bps_sent',
  fromItem: 'net',
  unit: 'bps',
  transfer: 1024,
  metric: metricItems.bps_sent.key,
}

// 宿主机 网络每秒接受字节数
const HOST_NET_RECV_BYTE_PER_SECEND = {
  name: 'net',
  label: i18n.t('monitor.text_132'),
  seleteItem: 'bps_recv',
  fromItem: 'net',
  unit: 'bps',
  transfer: 1024,
  metric: metricItems.bps_recv.key,
}

// 宿主机 网络接口发送数据包总数
const HOST_NET_SEND_PACKETS_NUM = {
  name: 'net',
  label: i18n.t('monitor.text_133'),
  seleteItem: 'packets_sent',
  fromItem: 'net',
  unit: 'count',
  transfer: 1,
  metric: 'net.packets_sent',
}

// 宿主机 网络接口接收数据包总数
const HOST_NET_RECV_PACKETS_NUM = {
  name: 'net',
  label: i18n.t('monitor.text_134'),
  seleteItem: 'packets_recv',
  fromItem: 'net',
  unit: 'count',
  transfer: 1,
  metric: 'net.packets_recv',
}

// 宿主机 网络接口丢失数据包总数
const HOST_NET_LOST_PACKETS_NUM = {
  name: 'net',
  label: i18n.t('monitor.text_135'),
  seleteItem: 'drop_out',
  fromItem: 'net',
  unit: 'count',
  transfer: 1,
  metric: 'net.drop_out',
}

// agent 宿主机 monitor
export const HOST_AGENT_MONITOR = [
  HOST_CPU_USED_PERCENT,
  HOST_MEM_USED_PERCENT,
  HOST_MEM_USED,
  HOST_DISK_USED_PERCENT,
  HOST_CPU_IO_USED_PERCENT,
  HOST_DISK_IO_READ_RATES,
  HOST_DISK_IO_WRITE_RATES,
  HOST_DISK_READ_NUM,
  HOST_DISK_WRITE_NUM,
  HOST_NET_SEND_BYTE_PER_SECEND,
  HOST_NET_RECV_BYTE_PER_SECEND,
  HOST_NET_SEND_PACKETS_NUM,
  HOST_NET_RECV_PACKETS_NUM,
  HOST_NET_LOST_PACKETS_NUM,
]
