import { sizestrWithUnit } from '@/utils/utils'

// 不定单位使用formatter，固定单位使用unit
export const USAGE_CONFIG = {
  'all.bucket_bytes': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'all.bucket_objects': {
    unit: '个',
  },
  'all.buckets': {
    unit: '个',
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
    unit: '个',
  },
  'all.eip.floating_ip': {
    unit: '个',
  },
  'all.eip.floating_ip.used': {
    unit: '个',
  },
  'all.eip.public_ip': {
    unit: '个',
  },
  'all.eip.used': {
    unit: '个',
  },
  'all.memory_commit_rate.running': {

  },
  'all.nics': {
    unit: '个',
  },
  'all.nics.guest': {
    unit: '台',
  },
  'all.nics.host': {
    unit: '台',
  },
  'all.nics.lb': {
    unit: '个',
  },
  'all.nics.reserve': {
    unit: '个',
  },
  'all.pending_delete_servers': {
    unit: '个',
  },
  'all.pending_delete_servers.cpu': {
    unit: '核',
  },
  'all.pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.pending_delete_servers.ha': {
    unit: '台',
  },
  'all.pending_delete_servers.ha.cpu': {
    unit: '核',
  },
  'all.pending_delete_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.pending_delete_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.pending_delete_servers.isolated_devices': {
    unit: '块',
  },
  'all.pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.ports': {
    unit: '个',
  },
  'all.ports_exit': {
    unit: '个',
  },
  'all.ready_servers': {
    unit: '台',
  },
  'all.ready_servers.cpu': {
    unit: '核',
  },
  'all.ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.ready_servers.ha': {
    unit: '台',
  },
  'all.ready_servers.ha.cpu': {
    unit: '核',
  },
  'all.ready_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.ready_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.ready_servers.isolated_devices': {
    unit: '块',
  },
  'all.ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.running_servers': {
    unit: '台',
  },
  'all.running_servers.cpu': {
    unit: '核',
  },
  'all.running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.running_servers.ha': {
    unit: '台',
  },
  'all.running_servers.ha.cpu': {
    unit: '核',
  },
  'all.running_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.running_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.running_servers.isolated_devices': {
    unit: '块',
  },
  'all.running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.servers': {
    unit: '台',
  },
  'all.servers.cpu': {
    unit: '核',
  },
  'all.servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.servers.ha': {
    unit: '台',
  },
  'all.servers.ha.cpu': {
    unit: '核',
  },
  'all.servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.servers.isolated_devices': {
    unit: '块',
  },
  'all.servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'all.snapshot': {
    unit: '个',
  },
  'baremetals': {
    unit: '个',
  },
  'baremetals.cpu': {
    unit: '核',
  },
  'baremetals.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'bucket_bytes': {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
  },
  'bucket_objects': {
    unit: '个',
  },
  'buckets': {
    unit: '个',
  },
  'disks': {
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
  'eip': {
    unit: '个',
  },
  'eip.floating_ip': {
    unit: '个',
  },
  'eip.floating_ip.used': {
    unit: '个',
  },
  'eip.public_ip': {
    unit: '个',
  },
  'eip.used': {
    unit: '个',
  },
  'enabled_hosts': {
    unit: '台',
  },
  'enabled_hosts.cpu': {
    unit: '核',
  },
  'enabled_hosts.cpu.virtual': {
    unit: '核',
  },
  'enabled_hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'enabled_hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'hosts': {
    unit: '台',
  },
  'hosts.cpu': {
    unit: '核',
  },
  'hosts.cpu.virtual': {
    unit: '核',
  },
  'hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'isolated_devices': {
    unit: '个',
  },
  'networks': {
    unit: '个',
  },
  'nics': {
    unit: '个',
  },
  'nics.guest': {
    unit: '台',
  },
  'nics.lb': {
    unit: '个',
  },
  'pending_delete_servers': {
    unit: '台',
  },
  'pending_delete_servers.cpu': {
    unit: '核',
  },
  'pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'pending_delete_servers.ha': {
    unit: '台',
  },
  'pending_delete_servers.ha.cpu': {
    unit: '核',
  },
  'pending_delete_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'pending_delete_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'pending_delete_servers.isolated_devices': {
    unit: '个',
  },
  'pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'ports': {
    unit: '个',
  },
  'ports_exit': {
    unit: '个',
  },
  'ready_servers': {
    unit: '台',
  },
  'ready_servers.cpu': {
    unit: '核',
  },
  'ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'ready_servers.ha': {
    unit: '台',
  },
  'ready_servers.ha.cpu': {
    unit: '核',
  },
  'ready_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'ready_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'ready_servers.isolated_devices': {
    unit: '块',
  },
  'ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'regions': {
    unit: '个',
  },
  'running_servers': {
    unit: '台',
  },
  'running_servers.cpu': {
    unit: '核',
  },
  'running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'running_servers.ha': {

  },
  'running_servers.ha.cpu': {
    unit: '核',
  },
  'running_servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'running_servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'running_servers.isolated_devices': {
    unit: '块',
  },
  'running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'servers': {
    unit: '台',
  },
  'servers.cpu': {
    unit: '核',
  },
  'servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'servers.ha': {
    unit: '台',
  },
  'servers.ha.cpu': {
    unit: '核',
  },
  'servers.ha.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'servers.ha.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'servers.isolated_devices': {
    unit: '块',
  },
  'servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'snapshot': {
    unit: '个',
  },
  'storages': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'storages.commit_rate': {

  },
  'storages.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
  },
  'vpcs': {
    unit: '个',
  },
  'wires': {
    unit: '个',
  },
  'zones': {
    unit: '个',
  },
}
