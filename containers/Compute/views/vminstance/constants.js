import { metricItems } from '@Compute/views/node-alert/constants'
import i18n from '@/locales'

const DISK_USED_PERCENT = {
  name: 'disk',
  label: i18n.t('compute.text_533'),
  seleteItem: 'used_percent',
  as: i18n.t('compute.text_533'),
  fromItem: 'agent_disk',
  unit: '%',
  transfer: 1,
  metric: metricItems.used_percent.key,
}

const MEM_USED_PERCENT = {
  name: 'mem',
  label: i18n.t('compute.text_518'),
  seleteItem: 'used_percent',
  fromItem: 'agent_mem',
  unit: '%',
  transfer: 1,
  metric: metricItems['vm_mem.used_percent'].key,
}

const CPU_USED_PERCENT = {
  name: 'cpu',
  label: i18n.t('compute.text_523'),
  seleteItem: 'usage_active',
  fromItem: 'agent_cpu',
  unit: '%',
  transfer: 1,
  metric: metricItems['vm_cpu.usage_active'].key,
}

const DISK_IO_READ_RATES = {
  name: 'mem',
  label: i18n.t('compute.text_526'),
  seleteItem: 'read_bps',
  fromItem: 'agent_diskio',
  unit: 'bps',
  transfer: 1024,
  metric: metricItems['vm_diskio.read_bps'].key,
}

const DISK_IO_WRITE_RATES = {
  name: 'mem',
  label: i18n.t('compute.text_527'),
  seleteItem: 'write_bps',
  fromItem: 'agent_diskio',
  unit: 'bps',
  transfer: 1024,
  metric: metricItems['vm_diskio.write_bps'].key,
}

const NET_SEND_BYTES = {
  name: 'net',
  label: i18n.t('compute.text_524'),
  seleteItem: 'bytes_sent',
  selectFunction: 'derivative',
  fromItem: 'agent_net',
  unit: 'bps',
  transfer: 1024,
  metric: metricItems['vm_mem.used_percent'].key,
}

const NET_RECV_BYTES = {
  name: 'net',
  label: i18n.t('compute.text_525'),
  seleteItem: 'bytes_recv',
  selectFunction: 'derivative',
  fromItem: 'agent_net',
  unit: 'bps',
  transfer: 1024,
  metric: metricItems['vm_mem.used_percent'].key,
}

export const AGENT_MONITOR = [
  CPU_USED_PERCENT,
  MEM_USED_PERCENT,
  DISK_USED_PERCENT,
  DISK_IO_READ_RATES,
  DISK_IO_WRITE_RATES,
  NET_SEND_BYTES,
  NET_RECV_BYTES,
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
