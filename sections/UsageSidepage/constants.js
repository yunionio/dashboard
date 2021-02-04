import { sizestrWithUnit } from '@/utils/utils'
import i18n from '@/locales'

// noPerfix 表示此usage不用区分 all 或 domain

// 不定单位使用formatter，固定单位使用unit
export const USAGE_CONFIG = {
  bucket_bytes: {
    formatter: val => sizestrWithUnit(val, 'B', 1024),
    zh_cn: i18n.t('cloudenv.text_23'),
  },
  bucket_objects: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_25'),
  },
  buckets: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_26'),
  },
  disks: {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_27'),
  },
  'disks.attached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_28'),
  },
  'disks.detached': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_29'),
  },
  'disks.unready': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_30'),
  },
  eip: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_31'),
  },
  'eip.floating_ip': {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_32'),
  },
  'eip.floating_ip.used': {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_33'),
  },
  'eip.public_ip': {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_34'),
  },
  'eip.used': {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_35'),
  },
  enabled_hosts: {
    unit: i18n.t('cloudenv.text_36'),
    zh_cn: i18n.t('cloudenv.text_37'),
  },
  'enabled_hosts.cpu': {
    unit: i18n.t('cloudenv.text_38'),
    zh_cn: i18n.t('cloudenv.text_39'),
  },
  'enabled_hosts.cpu.virtual': {
    unit: i18n.t('cloudenv.text_38'),
    zh_cn: i18n.t('cloudenv.text_40'),
  },
  'enabled_hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_41'),
  },
  'enabled_hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_42'),
  },
  hosts: {
    unit: i18n.t('cloudenv.text_36'),
    zh_cn: i18n.t('cloudenv.text_43'),
  },
  'hosts.cpu': {
    unit: i18n.t('cloudenv.text_38'),
    zh_cn: i18n.t('cloudenv.text_44'),
  },
  'hosts.cpu.virtual': {
    unit: i18n.t('cloudenv.text_38'),
    zh_cn: i18n.t('cloudenv.text_45'),
  },
  'hosts.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_46'),
  },
  'hosts.memory.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_47'),
  },
  isolated_devices: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_48'),
  },
  networks: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_49'),
    noPerfix: true,
  },
  nics: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_50'),
  },
  'nics.guest': {
    unit: i18n.t('cloudenv.text_36'),
    zh_cn: i18n.t('cloudenv.text_51'),
  },
  'nics.lb': {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_52'),
  },
  pending_delete_servers: {
    unit: i18n.t('cloudenv.text_36'),
    zh_cn: i18n.t('cloudenv.text_53'),
  },
  'pending_delete_servers.cpu': {
    unit: i18n.t('cloudenv.text_38'),
    zh_cn: i18n.t('cloudenv.text_54'),
  },
  'pending_delete_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_55'),
  },
  'pending_delete_servers.isolated_devices': {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_56'),
  },
  'pending_delete_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_57'),
  },
  ports: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_58'),
  },
  ports_exit: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_59'),
  },
  ready_servers: {
    unit: i18n.t('cloudenv.text_36'),
    zh_cn: i18n.t('cloudenv.text_60'),
  },
  'ready_servers.cpu': {
    unit: i18n.t('cloudenv.text_38'),
    zh_cn: i18n.t('cloudenv.text_61'),
  },
  'ready_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_62'),
  },
  'ready_servers.isolated_devices': {
    unit: i18n.t('cloudenv.text_63'),
    zh_cn: i18n.t('cloudenv.text_64'),
  },
  'ready_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_65'),
  },
  regions: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_66'),
  },
  running_servers: {
    unit: i18n.t('cloudenv.text_36'),
    zh_cn: i18n.t('cloudenv.text_67'),
  },
  'running_servers.cpu': {
    unit: i18n.t('cloudenv.text_38'),
    zh_cn: i18n.t('cloudenv.text_68'),
  },
  'running_servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_69'),
  },
  'running_servers.isolated_devices': {
    unit: i18n.t('cloudenv.text_63'),
    zh_cn: i18n.t('cloudenv.text_70'),
  },
  'running_servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_71'),
  },
  servers: {
    unit: i18n.t('cloudenv.text_36'),
    zh_cn: i18n.t('cloudenv.text_72'),
  },
  'servers.cpu': {
    unit: i18n.t('cloudenv.text_38'),
    zh_cn: i18n.t('cloudenv.text_73'),
  },
  'servers.disk': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_74'),
  },
  'servers.isolated_devices': {
    unit: i18n.t('cloudenv.text_63'),
    zh_cn: i18n.t('cloudenv.text_75'),
  },
  'servers.memory': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_76'),
  },
  snapshot: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_77'),
  },
  storages: {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_78'),
    noPerfix: true,
  },
  'storages.virtual': {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.text_79'),
    noPerfix: true,
  },
  vpcs: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_80'),
    noPerfix: true,
  },
  wires: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_81'),
    noPerfix: true,
  },
  zones: {
    unit: i18n.t('cloudenv.text_24'),
    zh_cn: i18n.t('cloudenv.text_82'),
    noPerfix: true,
  },
}

export const USAGE_CONFIG_MAP = {
  servers: {
    zh_cn: i18n.t('cloudenv.res_servers'),
  },
  loadbalancer: {
    zh_cn: i18n.t('cloudenv.res_loadbalancer'),
  },
  rds: {
    zh_cn: i18n.t('cloudenv.res_rds'),
  },
  cache: {
    zh_cn: i18n.t('cloudenv.res_cache'),
  },
  buckets: {
    zh_cn: i18n.t('cloudenv.res_bucket_objects'),
  },
  bucket_bytes: {
    formatter: val => sizestrWithUnit(val, 'M', 1024),
    zh_cn: i18n.t('cloudenv.res_bucket_bytes'),
  },
  'eip.floating_ip': {
    zh_cn: i18n.t('cloudenv.res_eip_floating_ip'),
  },
  'eip.public_ip': {
    zh_cn: i18n.t('cloudenv.res_eip_public_ip'),
  },
  snapshot: {
    zh_cn: i18n.t('cloudenv.res_snapshot'),
  },
  vpcs: {
    zh_cn: i18n.t('cloudenv.res_vpcs'),
  },
  networks: {
    zh_cn: i18n.t('cloudenv.res_networks'),
  },
  ports: {
    zh_cn: i18n.t('cloudenv.res_ports'),
  },
}

export const USAGE_RING_DATAS = [
  {
    name: i18n.t('dashboard.text_151'),
    sum: 'servers',
    use: 'ready_servers',
    use_label: i18n.t('dashboard.shutdown'),
    unuse_label: i18n.t('dashboard.not_shutdown'),
  },
  {
    name: i18n.t('dashboard.text_147'),
    sum: 'disks.count',
    use: 'disks.attached.count',
    use_label: i18n.t('dashboard.mounted'),
    unuse_label: i18n.t('dashboard.not_mounted'),
  },
  {
    name: i18n.t('dashboard.text_156'),
    sum: 'eip.floating_ip',
    use: 'eip.floating_ip.used',
    use_label: i18n.t('dashboard.text_33'),
    unuse_label: i18n.t('dashboard.text_34'),
  },
  {
    name: i18n.t('dashboard.text_152'),
    sum: 'ports',
    use: 'nics',
    use_label: i18n.t('dashboard.text_33'),
    unuse_label: i18n.t('dashboard.text_34'),
  },
]
