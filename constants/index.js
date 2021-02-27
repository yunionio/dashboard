import { sizestrWithUnit } from '@/utils/utils'
import i18n from '@/locales'
import { SCOPES_MAP } from '@/constants'

// 不定单位使用formatter，固定单位使用unit
// 磁盘（disk）、内存（memory） 容量单位为：formatter: val => sizestrWithUnit(val, 'M', 1024)
// 虚拟机（server）、宿主机（host）、物理机（baremetal） 单位为：台
// CPU 单位为：核
// GPU（isolated_device） 单位为：块
// nics 和 ports 的区别：ports是所有的IP，nics是被占用的IP，ports包含nics。nics和ports的单位都是个。
export const USAGE_CONFIG = {
  'all.bucket_bytes': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.bucket_objects': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.buckets': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cpu_commit_rate.running': {
    scope: SCOPES_MAP.system.key,
  },
  'all.disks': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.disks.attached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.disks.detached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.disks.unready': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.eip': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.eip.floating_ip': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.eip.floating_ip.used': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.eip.public_ip': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.eip.used': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.memory_commit_rate.running': {
    scope: SCOPES_MAP.system.key,
  },
  'all.nics': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.nics.guest': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.nics.host': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.nics.lb': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.nics.reserve': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.pending_delete_servers': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.pending_delete_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.pending_delete_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.pending_delete_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.pending_delete_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.pending_delete_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.pending_delete_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.system.key,
  },
  'all.pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.ports': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.ports_exit': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.ready_servers': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.ready_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.ready_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.ready_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.ready_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.ready_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.ready_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.system.key,
  },
  'all.ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.running_servers': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.running_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.running_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.running_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.running_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.running_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.running_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.system.key,
  },
  'all.running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.any_pool': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.snapshot': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.system': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'all.disks.system': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.system.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.servers.system.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  baremetals: {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'baremetals.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'baremetals.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  bucket_bytes: {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.project.key,
  },
  bucket_objects: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  buckets: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  disks: {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'disks.attached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'disks.detached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'disks.unready': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  eip: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'eip.floating_ip': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'eip.floating_ip.used': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'eip.public_ip': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'eip.used': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  enabled_hosts: {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'enabled_hosts.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'enabled_hosts.cpu.virtual': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'enabled_hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'enabled_hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  hosts: {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'hosts.any_pool': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.system.key,
  },
  'hosts.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'hosts.cpu.total': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'hosts.cpu.virtual': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'hosts.memory.total': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  isolated_devices: {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.system.key,
  },
  networks: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  nics: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'nics.guest': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'nics.lb': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'domain.nics': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.nics.guest': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.nics.lb': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  pending_delete_servers: {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.project.key,
  },
  'pending_delete_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'pending_delete_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.project.key,
  },
  'pending_delete_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'pending_delete_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'pending_delete_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'pending_delete_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.project.key,
  },
  'pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  ports: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  ports_exit: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  ready_servers: {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.project.key,
  },
  'ready_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'ready_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.project.key,
  },
  'ready_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'ready_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'ready_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'ready_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.project.key,
  },
  'ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  regions: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  running_servers: {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.project.key,
  },
  'running_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'running_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.project.key,
  },
  'running_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'running_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'running_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'running_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.project.key,
  },
  'running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  servers: {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.project.key,
  },
  'servers.any_pool': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.project.key,
  },
  'servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.project.key,
  },
  'servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.project.key,
  },
  'servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.project.key,
  },
  snapshot: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  storages: {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'storages.commit_rate': {
    scope: SCOPES_MAP.system.key,
  },
  'storages.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.system.key,
  },
  vpcs: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  wires: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  zones: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.disks.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.disks.attached.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.disks.detached.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.disks.unready.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.loadbalancer': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cache': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.rds': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  cache: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'disks.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'disks.attached.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'disks.detached.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'disks.unready.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  loadbalancer: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  rds: {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'domain.baremetals': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.baremetals.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.baremetals.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.bucket_bytes': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.bucket_objects': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.buckets': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cache': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cpu_commit_rate.running': {
    scope: SCOPES_MAP.domain.key,
  },
  'domain.disks': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.disks.attached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.disks.attached.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.disks.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.disks.detached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.disks.detached.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.disks.unready': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.disks.unready.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.eip': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.eip.floating_ip': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.eip.floating_ip.used': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.eip.public_ip': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.eip.used': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.enabled_hosts': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.enabled_hosts.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.enabled_hosts.cpu.virtual': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.enabled_hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.enabled_hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.hosts': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.hosts.any_pool': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.hosts.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.hosts.cpu.virtual': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.loadbalancer': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.memory_commit_rate.running': {
    scope: SCOPES_MAP.domain.key,
  },
  'domain.pending_delete_servers': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.pending_delete_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.pending_delete_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.pending_delete_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.pending_delete_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.pending_delete_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.pending_delete_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ports': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ports_exit': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.rds': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ready_servers': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ready_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ready_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ready_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ready_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ready_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ready_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.running_servers': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.running_servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.running_servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.running_servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.running_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.running_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.running_servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers.any_pool': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers.ha': {
    unit: i18n.t('dashboard.text_2'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers.ha.cpu': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers.isolated_devices': {
    unit: i18n.t('dashboard.text_4'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.snapshot': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.storages': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.storages.commit_rate': {
    scope: SCOPES_MAP.domain.key,
  },
  'domain.storages.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.vpcs': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'all.img.total.size': {
    formatter: val => sizestrWithUnit(val, 'B', 1000),
    scope: SCOPES_MAP.system.key,
  },
  'domain.img.total.size': {
    formatter: val => sizestrWithUnit(val, 'B', 1000),
    scope: SCOPES_MAP.domain.key,
  },
  'img.total.size': {
    formatter: val => sizestrWithUnit(val, 'B', 1000),
    scope: SCOPES_MAP.project.key,
  },
  'all.iso.total.size': {
    formatter: val => sizestrWithUnit(val, 'B', 1000),
    scope: SCOPES_MAP.system.key,
  },
  'domain.iso.total.size': {
    formatter: val => sizestrWithUnit(val, 'B', 1000),
    scope: SCOPES_MAP.domain.key,
  },
  'iso.total.size': {
    formatter: val => sizestrWithUnit(val, 'B', 1000),
    scope: SCOPES_MAP.project.key,
  },
  'all.imgiso.total.size': {
    formatter: val => sizestrWithUnit(val, 'B', 1000),
    scope: SCOPES_MAP.system.key,
  },
  'domain.imgiso.total.size': {
    formatter: val => sizestrWithUnit(val, 'B', 1000),
    scope: SCOPES_MAP.domain.key,
  },
  'imgiso.total.size': {
    formatter: val => sizestrWithUnit(val, 'B', 1000),
    scope: SCOPES_MAP.project.key,
  },
}

export const K8S_USAGE_CONFIG = {
  'all.cluster.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.not_ready_count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.ready_count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.pod.capacity': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.pod.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.cpu.capacity': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.cpu.limit': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.cpu.request': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.memory.capacity': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.memory.limit': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'all.cluster.node.memory.request': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.system.key,
  },
  'domain.cluster.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.not_ready_count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.ready_count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.pod.capacity': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.pod.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.cpu.capacity': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.cpu.limit': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.cpu.request': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.memory.capacity': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.memory.limit': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'domain.cluster.node.memory.request': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.domain.key,
  },
  'project.cluster.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.not_ready_count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.ready_count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.pod.capacity': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.pod.count': {
    unit: i18n.t('dashboard.text_1'),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.cpu.capacity': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.cpu.limit': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.cpu.request': {
    unit: i18n.t('dashboard.text_3'),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.memory.capacity': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.memory.limit': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.project.key,
  },
  'project.cluster.node.memory.request': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    scope: SCOPES_MAP.project.key,
  },
}

export const PROJECT_QUOTA_CONFIG = {
  'project-quota-common': {
    cpu: {
      unit: i18n.t('dashboard.text_3'),
    },
    'usage.cpu': {
      unit: i18n.t('dashboard.text_3'),
    },
    memory: {
      formatter: val => sizestrWithUnit(val, 'M', 1024),
    },
    'usage.memory': {
      formatter: val => sizestrWithUnit(val, 'M', 1024),
    },
    storage: {
      formatter: val => sizestrWithUnit(val, 'M', 1024),
    },
    'usage.storage': {
      formatter: val => sizestrWithUnit(val, 'M', 1024),
    },
    isolated_device: {
      unit: i18n.t('dashboard.text_4'),
    },
    'usage.isolated_device': {
      unit: i18n.t('dashboard.text_4'),
    },
  },
  'project-quota-image': {
    image: {
      unit: i18n.t('dashboard.text_1'),
    },
    'usage.image': {
      unit: i18n.t('dashboard.text_1'),
    },
  },
  'project-quota-region': {
    eip: {
      unit: i18n.t('dashboard.text_1'),
    },
    'usage.eip': {
      unit: i18n.t('dashboard.text_1'),
    },
    port: {
      unit: i18n.t('dashboard.text_1'),
    },
    'usage.port': {
      unit: i18n.t('dashboard.text_1'),
    },
    snapshot: {
      unit: i18n.t('dashboard.text_1'),
    },
    'usage.snapshot': {
      unit: i18n.t('dashboard.text_1'),
    },
  },
}
