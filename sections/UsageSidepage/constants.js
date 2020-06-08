import { sizestrWithUnit } from '@/utils/utils'

// 不定单位使用formatter，固定单位使用unit
export const USAGE_CONFIG = {
  bucket_bytes: {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    zh_cn: '对象存储容量',
  },
  bucket_objects: {
    unit: '个',
    zh_cn: '对象存储文件数量',
  },
  buckets: {
    unit: '个',
    zh_cn: '存储桶数量',
  },
  disks: {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '磁盘容量',
  },
  'disks.attached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '已挂载磁盘的容量',
  },
  'disks.detached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '未挂载磁盘的容量',
  },
  'disks.unready': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '异常状态的磁盘容量',
  },
  eip: {
    unit: '个',
    zh_cn: '弹性公网IP和公网IP总数',
  },
  'eip.floating_ip': {
    unit: '个',
    zh_cn: '弹性公网IP总量',
  },
  'eip.floating_ip.used': {
    unit: '个',
    zh_cn: '已使用的弹性公网IP数量',
  },
  'eip.public_ip': {
    unit: '个',
    zh_cn: '公网IP总量',
  },
  'eip.used': {
    unit: '个',
    zh_cn: '已使用的弹性公网IP和公网IP数量',
  },
  enabled_hosts: {
    unit: '台',
    zh_cn: '启用的宿主机数量',
  },
  'enabled_hosts.cpu': {
    unit: '核',
    zh_cn: '启用的宿主机CPU数量',
  },
  'enabled_hosts.cpu.virtual': {
    unit: '核',
    zh_cn: '启用的宿主机CPU虚拟数量',
  },
  'enabled_hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '启用的宿主机内存容量',
  },
  'enabled_hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '启用的宿主机内存虚拟容量',
  },
  hosts: {
    unit: '台',
    zh_cn: '宿主机总量',
  },
  'hosts.cpu': {
    unit: '核',
    zh_cn: '宿主机CPU总量',
  },
  'hosts.cpu.virtual': {
    unit: '核',
    zh_cn: '宿主机CPU虚拟总量',
  },
  'hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '宿主机内存容量',
  },
  'hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '宿主机内存虚拟容量',
  },
  isolated_devices: {
    unit: '个',
    zh_cn: 'GPU卡总量',
  },
  networks: {
    unit: '个',
    zh_cn: 'IP子网总量',
  },
  nics: {
    unit: '个',
    zh_cn: '当前项目网卡数量',
  },
  'nics.guest': {
    unit: '台',
    zh_cn: '虚拟机网卡数量',
  },
  'nics.lb': {
    unit: '个',
    zh_cn: '负载均衡网卡数量',
  },
  pending_delete_servers: {
    unit: '台',
    zh_cn: '回收站虚拟机数量',
  },
  'pending_delete_servers.cpu': {
    unit: '核',
    zh_cn: '回收站虚拟机CPU的数量',
  },
  'pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '回收站虚拟机磁盘容量',
  },
  'pending_delete_servers.isolated_devices': {
    unit: '个',
    zh_cn: '回收站虚拟机GPU卡数量',
  },
  'pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '回收站虚拟机内存容量',
  },
  ports: {
    unit: '个',
    zh_cn: 'IP总量',
  },
  ports_exit: {
    unit: '个',
    zh_cn: '外网IP数量',
  },
  ready_servers: {
    unit: '台',
    zh_cn: '关机状态虚拟机数量',
  },
  'ready_servers.cpu': {
    unit: '核',
    zh_cn: '关机状态虚拟机CPU数量',
  },
  'ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '关机状态虚拟机磁盘容量',
  },
  'ready_servers.isolated_devices': {
    unit: '块',
    zh_cn: '关机状态的虚拟机GPU卡数量',
  },
  'ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '关机状态的虚拟机内存容量',
  },
  regions: {
    unit: '个',
    zh_cn: '区域总数量',
  },
  running_servers: {
    unit: '台',
    zh_cn: '运行状态的虚拟机数量',
  },
  'running_servers.cpu': {
    unit: '核',
    zh_cn: '运行状态的虚拟机CPU数量',
  },
  'running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '运行状态的虚拟机磁盘容量',
  },
  'running_servers.isolated_devices': {
    unit: '块',
    zh_cn: '运行状态的虚拟机GPU卡数量',
  },
  'running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '运行状态的虚拟机内存容量',
  },
  servers: {
    unit: '台',
    zh_cn: '虚拟机数量',
  },
  'servers.cpu': {
    unit: '核',
    zh_cn: '虚拟机CPU数量',
  },
  'servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '虚拟机磁盘容量',
  },
  'servers.isolated_devices': {
    unit: '块',
    zh_cn: '虚拟机GPU卡数量',
  },
  'servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '虚拟机内存容量',
  },
  snapshot: {
    unit: '个',
    zh_cn: '快照数量',
  },
  storages: {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '存储总容量',
  },
  'storages.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: '存储总虚拟容量',
  },
  vpcs: {
    unit: '个',
    zh_cn: 'VPC数量',
  },
  wires: {
    unit: '个',
    zh_cn: '二层网络数量',
  },
  zones: {
    unit: '个',
    zh_cn: '可用区的数量',
  },
}
