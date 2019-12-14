// OneCloud 虚拟机监控数据
export const ONECLOUD_MONITOR = [
  {
    name: 'cpu',
    label: 'CPU使用率',
    seleteItem: 'usage_active',
    fromItem: 'vm_cpu',
    unit: '%',
    transfer: 1,
  },
  {
    name: 'netio',
    label: '网络入流量',
    seleteItem: 'bps_recv',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
  },
  {
    name: 'netio',
    label: '网络出流量',
    seleteItem: 'bps_sent',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
  },
  {
    name: 'diskio',
    label: '磁盘读速率',
    seleteItem: 'read_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
  },
  {
    name: 'diskio',
    label: '磁盘写速率',
    seleteItem: 'write_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
  },
]

// vmware 虚拟机监控数据
export const VMWARE_MONITOR = [
  {
    name: 'cpu',
    label: 'CPU使用率',
    seleteItem: 'usage_active',
    fromItem: 'vm_cpu',
    unit: '%',
    transfer: 1,
  },
  {
    name: 'mem',
    label: '内存使用率',
    seleteItem: 'used_percent',
    fromItem: 'vm_mem',
    unit: '%',
    transfer: 1,
  },
  {
    name: 'netio',
    label: '网络入流量',
    seleteItem: 'bps_recv',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
  },
  {
    name: 'netio',
    label: '网络出流量',
    seleteItem: 'bps_sent',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
  },
  {
    name: 'diskio',
    label: '磁盘读速率',
    seleteItem: 'read_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
  },
  {
    name: 'diskio',
    label: '磁盘写速率',
    seleteItem: 'write_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
  },
]

// 除了 kvm、vmware 虚拟机监控数据
export const OTHER_MONITOR = [
  {
    name: 'cpu',
    label: 'CPU使用率',
    seleteItem: 'usage_active',
    transfer: 1,
    fromItem: 'vm_cpu',
    unit: '%',
  },
  {
    name: 'netio',
    label: '网络入流量',
    seleteItem: 'bps_recv',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
  },
  {
    name: 'netio',
    label: '网络出流量',
    seleteItem: 'bps_sent',
    fromItem: 'vm_netio',
    unit: 'bps',
    transfer: 1024,
  },
  {
    name: 'diskio',
    label: '磁盘读速率',
    seleteItem: 'read_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
  },
  {
    name: 'diskio',
    label: '磁盘写速率',
    seleteItem: 'write_bps',
    fromItem: 'vm_diskio',
    unit: 'bps',
    transfer: 1024,
  },
]
