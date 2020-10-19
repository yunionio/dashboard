import { sizestrWithUnit } from '@/utils/utils'
import i18n from '@/locales'

// 不定单位使用formatter，固定单位使用unit
// 磁盘（disk）、内存（memory） 容量单位为：formatter: val => sizestrWithUnit(val, 'M', 1024)
// 虚拟机（server）、宿主机（host）、物理机（baremetal） 单位为：台
// CPU 单位为：核
// GPU（isolated_device） 单位为：块
// nics 和 ports 的区别：ports是所有的IP，nics是被占用的IP，ports包含nics。nics和ports的单位都是个。
export const USAGE_CONFIG = {
  'all.bucket_bytes': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'all.bucket_objects': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.buckets': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.cpu_commit_rate.running': {

  },
  'all.disks': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.disks.attached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.disks.detached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.disks.unready': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.eip': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.eip.floating_ip': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.eip.floating_ip.used': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.eip.public_ip': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.eip.used': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.memory_commit_rate.running': {

  },
  'all.nics': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.nics.guest': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.nics.host': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.nics.lb': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.nics.reserve': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.pending_delete_servers': {
    unit: i18n.t('dashboard.text_2'),
  },
  'all.pending_delete_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.pending_delete_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'all.pending_delete_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.pending_delete_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.pending_delete_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.pending_delete_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'all.pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.ports': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.ports_exit': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.ready_servers': {
    unit: i18n.t('dashboard.text_2'),
  },
  'all.ready_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.ready_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'all.ready_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.ready_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.ready_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.ready_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'all.ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.running_servers': {
    unit: i18n.t('dashboard.text_2'),
  },
  'all.running_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.running_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'all.running_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.running_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.running_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.running_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'all.running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.servers': {
    unit: i18n.t('dashboard.text_2'),
  },
  'all.servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'all.servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'all.servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.snapshot': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.servers.system': {
    unit: i18n.t('dashboard.text_2'),
  },
  'all.disks.system': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.servers.system.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.servers.system.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  baremetals: {
    unit: i18n.t('dashboard.text_2'),
  },
  'baremetals.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'baremetals.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  bucket_bytes: {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  bucket_objects: {
    unit: i18n.t('dashboard.text_1'),
  },
  buckets: {
    unit: i18n.t('dashboard.text_1'),
  },
  disks: {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'disks.attached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'disks.detached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'disks.unready': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  eip: {
    unit: i18n.t('dashboard.text_1'),
  },
  'eip.floating_ip': {
    unit: i18n.t('dashboard.text_1'),
  },
  'eip.floating_ip.used': {
    unit: i18n.t('dashboard.text_1'),
  },
  'eip.public_ip': {
    unit: i18n.t('dashboard.text_1'),
  },
  'eip.used': {
    unit: i18n.t('dashboard.text_1'),
  },
  enabled_hosts: {
    unit: i18n.t('dashboard.text_2'),
  },
  'enabled_hosts.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'enabled_hosts.cpu.virtual': {
    unit: i18n.t('dashboard.text_3'),
  },
  'enabled_hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'enabled_hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  hosts: {
    unit: i18n.t('dashboard.text_2'),
  },
  'hosts.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'hosts.cpu.virtual': {
    unit: i18n.t('dashboard.text_3'),
  },
  'hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  isolated_devices: {
    unit: i18n.t('dashboard.text_4'),
  },
  networks: {
    unit: i18n.t('dashboard.text_1'),
  },
  nics: {
    unit: i18n.t('dashboard.text_1'),
  },
  'nics.guest': {
    unit: i18n.t('dashboard.text_1'),
  },
  'nics.lb': {
    unit: i18n.t('dashboard.text_1'),
  },
  pending_delete_servers: {
    unit: i18n.t('dashboard.text_2'),
  },
  'pending_delete_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'pending_delete_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'pending_delete_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'pending_delete_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'pending_delete_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'pending_delete_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  ports: {
    unit: i18n.t('dashboard.text_1'),
  },
  ports_exit: {
    unit: i18n.t('dashboard.text_1'),
  },
  ready_servers: {
    unit: i18n.t('dashboard.text_2'),
  },
  'ready_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'ready_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'ready_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'ready_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'ready_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'ready_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  regions: {
    unit: i18n.t('dashboard.text_1'),
  },
  running_servers: {
    unit: i18n.t('dashboard.text_2'),
  },
  'running_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'running_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'running_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'running_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'running_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'running_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  servers: {
    unit: i18n.t('dashboard.text_2'),
  },
  'servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  snapshot: {
    unit: i18n.t('dashboard.text_1'),
  },
  storages: {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'storages.commit_rate': {

  },
  'storages.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  vpcs: {
    unit: i18n.t('dashboard.text_1'),
  },
  wires: {
    unit: i18n.t('dashboard.text_1'),
  },
  zones: {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.disks.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.disks.attached.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.disks.detached.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.disks.unready.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.loadbalancer': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.cache': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.rds': {
    unit: i18n.t('dashboard.text_1'),
  },
  cache: {
    unit: i18n.t('dashboard.text_1'),
  },
  'disks.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'disks.attached.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'disks.detached.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'disks.unready.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  loadbalancer: {
    unit: i18n.t('dashboard.text_1'),
  },
  rds: {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.baremetals': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.baremetals.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.baremetals.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.bucket_bytes': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'domain.bucket_objects': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.buckets': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.cache': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.cpu_commit_rate.running': {

  },
  'domain.disks': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.disks.attached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.disks.attached.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.disks.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.disks.detached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.disks.detached.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.disks.unready': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.disks.unready.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.eip': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.eip.floating_ip': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.eip.floating_ip.used': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.eip.public_ip': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.eip.used': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.enabled_hosts': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.enabled_hosts.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.enabled_hosts.cpu.virtual': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.enabled_hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.enabled_hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.hosts': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.hosts.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.hosts.cpu.virtual': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.loadbalancer': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.memory_commit_rate.running': {

  },
  'domain.pending_delete_servers': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.pending_delete_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.pending_delete_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.pending_delete_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.pending_delete_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.pending_delete_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.pending_delete_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'domain.pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.ports': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.ports_exit': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.rds': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.ready_servers': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.ready_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.ready_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.ready_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.ready_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.ready_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.ready_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'domain.ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.running_servers': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.running_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.running_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.running_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.running_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.running_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.running_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'domain.running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.servers': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.servers.ha': {
    unit: i18n.t('dashboard.text_2'),
  },
  'domain.servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
  },
  'domain.servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.snapshot': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.storages': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.storages.commit_rate': {

  },
  'domain.storages.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'domain.vpcs': {
    unit: i18n.t('dashboard.text_1'),
  },
}

export const K8S_USAGE_CONFIG = {
  'all.cluster.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.cluster.node.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.cluster.node.not_ready_count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.cluster.node.ready_count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.cluster.node.pod.capacity': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.cluster.node.pod.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'all.cluster.node.cpu.capacity': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.cluster.node.cpu.limit': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.cluster.node.cpu.request': {
    unit: i18n.t('dashboard.text_3'),
  },
  'all.cluster.node.memory.capacity': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'all.cluster.node.memory.limit': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'all.cluster.node.memory.request': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'domain.cluster.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.cluster.node.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.cluster.node.not_ready_count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.cluster.node.ready_count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.cluster.node.pod.capacity': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.cluster.node.pod.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'domain.cluster.node.cpu.capacity': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.cluster.node.cpu.limit': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.cluster.node.cpu.request': {
    unit: i18n.t('dashboard.text_3'),
  },
  'domain.cluster.node.memory.capacity': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'domain.cluster.node.memory.limit': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'domain.cluster.node.memory.request': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'project.cluster.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'project.cluster.node.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'project.cluster.node.not_ready_count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'project.cluster.node.ready_count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'project.cluster.node.pod.capacity': {
    unit: i18n.t('dashboard.text_1'),
  },
  'project.cluster.node.pod.count': {
    unit: i18n.t('dashboard.text_1'),
  },
  'project.cluster.node.cpu.capacity': {
    unit: i18n.t('dashboard.text_3'),
  },
  'project.cluster.node.cpu.limit': {
    unit: i18n.t('dashboard.text_3'),
  },
  'project.cluster.node.cpu.request': {
    unit: i18n.t('dashboard.text_3'),
  },
  'project.cluster.node.memory.capacity': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'project.cluster.node.memory.limit': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'project.cluster.node.memory.request': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
}

export const PROJECT_QUOTA_CONFIG = {
  cpu: {
    unit: i18n.t('dashboard.text_3'),
  },
  'usage.cpu': {
    unit: i18n.t('dashboard.text_3'),
  },
}
