import i18n from '@/locales'

const requireComponent = require.context('@scope', true, /policyConfig\.(js)$/)
const keys = requireComponent.keys().filter(item => {
  const arr = item.split('/')
  return arr[1] === 'constants' && /\.(js)$/.test(arr[2])
})
let extraServices = {}
let extraResources = {}
keys.forEach(fileName => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName)
  const { SERVICES_MAP = {}, RESOURCES_MAP = {} } = componentConfig
  extraServices = { ...extraServices, ...SERVICES_MAP }
  extraResources = { ...extraResources, ...RESOURCES_MAP }
})

// 定义服务的映射
export const SERVICES_MAP = {
  compute: {
    i18n: 'service.compute',
  },
  image: {
    i18n: 'service.image',
  },
  k8s: {
    i18n: 'service.k8s',
  },
  meter: {
    i18n: 'service.meter',
  },
  identity: {
    i18n: 'service.identity',
  },
  notify: {
    i18n: 'service.notify',
  },
  log: {
    i18n: 'service.log',
  },
  yunionagent: {
    i18n: 'service.yunionagent',
  },
  itsm: {
    i18n: 'service.itsm',
  },
  cloudid: {
    i18n: 'service.cloudid',
  },
  monitor: {
    i18n: 'service.monitor',
  },
  yunionconf: {
    i18n: 'service.yunionconf',
  },
  cloudevent: {
    i18n: 'service.cloudevent',
  },
  suggestion: {
    i18n: 'service.suggestion',
  },
  report: {
    i18n: 'service.report',
  },
  extdb: {
    i18n: 'service.extdb',
  },
  devtool: {
    i18n: 'service.devtool',
  },
  bastionhost: {
    i18n: 'service.bastionhost',
  },
  scheduledtask: {
    i18n: 'service.scheduledtask',
  },
  autoupdate: {
    i18n: 'service.autoupdate',
  },
  ...extraServices,
}
// 定义资源的映射
export const RESOURCES_MAP = {
  servers: {
    i18n: 'dictionary.server',
    extras: [
      { action: 'get', label: 'VNC', value: 'vnc' },
      { action: 'perform', label: i18n.t('cloudenv.text_354'), value: 'syncstatus' },
      { action: 'perform', label: i18n.t('cloudenv.text_511'), value: 'start' },
      { action: 'perform', label: i18n.t('cloudenv.text_512'), value: 'stop' },
      { action: 'perform', label: i18n.t('cloudenv.text_513'), value: 'restart' },
      { action: 'perform', label: i18n.t('cloudenv.text_514'), value: 'reset' },
      { action: 'perform', label: i18n.t('cloudenv.text_515'), value: 'suspend' },
      { action: 'perform', label: i18n.t('cloudenv.text_516'), value: 'resume' },
      { action: 'perform', label: i18n.t('compute.start_rescue'), value: 'start-rescue' },
      { action: 'perform', label: i18n.t('compute.stop_rescue'), value: 'stop-rescue' },
      { action: 'perform', label: i18n.t('compute.sync_config'), value: 'sync' },
      { action: 'update', label: i18n.t('cloudenv.text_406'), value: '*' }, // 修改属性 同 update
      { action: 'perform', label: i18n.t('cloudenv.text_517'), value: 'rebuild-root' },
      { action: 'perform', label: i18n.t('cloudenv.text_518'), value: 'change-config' },
      { action: 'perform', label: i18n.t('cloudenv.text_519'), value: 'change-owner' },
      // { action: 'perform', label: i18n.t('cloudenv.text_520'), value: 'create-snapshot' },
      { action: 'perform', label: i18n.t('compute.create_snapshot_backup'), value: 'instance-backup' },
      { action: 'create', label: i18n.t('cloudenv.text_521'), value: '*' }, // 创建相同配置 同 create
      { action: 'perform', label: i18n.t('compute.set_usb_gpu'), value: 'set-isolated-device' },
      { action: 'perform', label: i18n.t('cloudenv.text_523'), value: 'io-throttle' },
      // { action: 'get', label: i18n.t('compute.bind_physical_cpu'), value: 'cpuset-cores' },
      { action: 'perform', label: i18n.t('compute.bind_physical_cpu'), value: 'cpuset' },
      { action: 'perform', label: i18n.t('cloudenv.text_524'), value: 'cancel-expire' },
      { action: 'perform', label: i18n.t('cloudenv.text_525'), value: 'snapshot-and-clone' },
      { action: 'perform', label: i18n.t('cloudenv.text_526'), value: 'bind-groups' },
      { action: 'perform', label: i18n.t('cloudenv.text_527'), value: 'renew' },
      { action: 'perform', label: i18n.t('cloudenv.text_528'), value: 'set-auto-renew' },
      { action: 'perform', label: i18n.t('compute.text_360'), value: 'deploy' },
      { action: 'perform', label: i18n.t('compute.text_276'), value: 'set-password' },
      { action: 'perform', label: i18n.t('compute.vminstance.actions.setup_ssh_authentication'), value: 'make-sshable' },
      { action: 'get', label: i18n.t('compute.vminstance.actions.detect_ssh_authentication'), value: 'sshable' },
      { action: 'perform', label: i18n.t('cloudenv.text_532'), value: 'save-image' },
      { action: 'perform', label: i18n.t('cloudenv.text_533'), value: 'insertiso' },
      { action: 'perform', label: i18n.t('cloudenv.text_534'), value: 'ejectiso' },
      { action: 'perform', label: i18n.t('cloudenv.text_535'), value: 'add-secgroup' },
      { action: 'perform', label: i18n.t('cloudenv.text_536'), value: 'create-eip' },
      { action: 'perform', label: i18n.t('cloudenv.text_537'), value: 'dissociate-eip' },
      { action: 'perform', label: i18n.t('cloudenv.text_538'), value: 'publicip-to-eip' },
      { action: 'perform', label: i18n.t('cloudenv.text_539'), value: 'modify-src-check' },
      { action: 'perform', label: i18n.t('cloudenv.text_540'), value: 'create-backup' },
      { action: 'perform', label: i18n.t('cloudenv.text_541'), value: 'delete-backup' },
      { action: 'perform', label: i18n.t('cloudenv.text_542'), value: 'migrate' },
      { action: 'perform', label: i18n.t('compute.change_boot_index'), value: 'set-boot-index' },
      { action: 'perform', label: i18n.t('compute.vminstance.change_disk_storage'), value: 'change-storage' },
      { action: 'perform', label: i18n.t('common_105'), value: 'set-user-metadata' },
      { action: 'perform', label: i18n.t('compute.text_674'), value: '*' },
    ],
  },
  images: {
    i18n: 'dictionary.image',
  },
  disks: {
    i18n: 'system.text_352',
  },
  snapshots: {
    i18n: 'system.text_93',
  },
  secgroups: {
    i18n: 'system.text_97',
  },
  eips: {
    i18n: 'system.text_92',
  },
  keypairs: {
    i18n: 'system.text_353',
  },
  recyclebins: {
    i18n: 'system.text_354',
  },
  loadbalancercertificates: {
    i18n: 'system.text_355',
  },
  loadbalancerlisteners: {
    i18n: 'system.text_356',
  },
  loadbalancerbackendgroups: {
    i18n: 'dictionary.loadbalancerbackendgroup',
  },
  loadbalanceracls: {
    i18n: 'system.text_1',
  },
  cloudregions: {
    i18n: 'system.text_52',
  },
  zones: {
    i18n: 'system.text_56',
  },
  hosts: {
    i18n: 'system.text_358',
    extras: [
      { action: 'perform', label: i18n.t('compute.text_567'), value: 'login-info' },
      { action: 'perform', label: i18n.t('compute.text_674'), value: '*' },
    ],
  },
  schedtags: {
    i18n: 'system.text_359',
  },
  isolated_devices: {
    i18n: 'system.text_360',
  },
  vpcs: {
    label: 'VPC',
  },
  route_tables: {
    i18n: 'system.text_361',
  },
  natgateways: {
    i18n: 'system.text_362',
  },
  wires: {
    i18n: 'system.text_363',
  },
  networks: {
    i18n: 'system.text_364',
  },
  reservedips: {
    i18n: 'system.text_365',
  },
  dnsrecords: {
    i18n: 'system.text_366',
  },
  storages: {
    i18n: 'system.text_87',
  },
  serverskus: {
    i18n: 'system.text_367',
  },
  cloudaccounts: {
    i18n: 'system.text_50',
  },
  loadbalancers: {
    i18n: 'system.text_368',
  },
  loadbalancerbackends: {
    i18n: 'system.text_369',
  },
  loadbalancerclusters: {
    i18n: 'system.text_370',
  },
  loadbalanceragents: {
    i18n: 'system.text_371',
  },
  dynamicschedtags: {
    i18n: 'system.text_372',
  },
  schedpolicies: {
    i18n: 'system.text_373',
  },
  pods: {
    i18n: 'system.text_374',
  },
  kubeclusters: {
    i18n: 'system.text_375',
  },
  k8s_nodes: {
    i18n: 'system.text_376',
  },
  namespaces: {
    i18n: 'system.text_377',
  },
  deployments: {
    i18n: 'system.text_378',
  },
  daemonsets: {
    i18n: 'system.text_379',
  },
  statefulsets: {
    i18n: 'system.text_380',
  },
  jobs: {
    i18n: 'system.text_381',
  },
  cronjobs: {
    i18n: 'system.text_382',
  },
  k8s_services: {
    i18n: 'system.text_383',
  },
  ingresses: {
    i18n: 'system.text_384',
  },
  configmaps: {
    i18n: 'system.text_385',
  },
  secrets: {
    i18n: 'system.text_386',
  },
  charts: {
    i18n: 'system.text_387',
  },
  rbacroles: {
    i18n: 'system.text_10',
  },
  rbacrolebindings: {
    i18n: 'system.text_388',
  },
  serviceaccounts: {
    i18n: 'system.text_389',
  },
  releases: {
    i18n: 'system.text_390',
  },
  bill_details: {
    i18n: 'system.text_391',
  },
  // bill_conditions: {
  //   label: '平台统计'
  // },
  bill_analysises: {
    i18n: 'system.text_392',
  },
  bill_balances: {
    i18n: 'system.text_50',
  },
  bill_resources: {
    i18n: 'system.text_393',
  },
  budgets: {
    i18n: 'system.bill_budgets',
  },
  associated_bills: {
    i18n: 'system.text_394',
  },
  domains: {
    i18n: 'dictionary.domain',
  },
  groups: {
    i18n: 'dictionary.group',
  },
  users: {
    i18n: 'dictionary.user',
  },
  policies: {
    i18n: 'dictionary.policy',
  },
  projects: {
    i18n: 'dictionary.project',
  },
  roles: {
    i18n: 'dictionary.role',
  },
  receivers: {
    i18n: 'dictionary.contact',
  },
  emailqueues: {
    i18n: 'system.text_395',
  },
  log: {
    i18n: 'common_706',
  },
  infos: {
    i18n: 'system.text_18',
  },
  notices: {
    i18n: 'system.text_20',
  },
  rates: {
    i18n: 'system.text_396',
  },
  kubemachines: {
    i18n: 'system.text_397',
  },
  persistentvolumeclaims: {
    i18n: 'system.text_398',
  },
  secgrouprules: {
    i18n: 'system.text_399',
  },
  loadbalancerlistenerrules: {
    i18n: 'system.text_400',
  },
  cloudproviders: {
    i18n: 'system.text_584',
  },
  externalprojects: {
    i18n: 'system.text_402',
  },
  'process-definitions': {
    i18n: 'system.text_403',
  },
  notifications: {
    i18n: 'dictionary.notification',
  },
  'isolated-devices': {
    i18n: 'system.text_404',
  },
  identity_providers: {
    i18n: 'dictionary.identity_provider',
  },
  snapshotpolicies: {
    i18n: 'system.text_405',
  },
  buckets: {
    i18n: 'system.text_406',
  },
  endpoints: {
    i18n: 'system.text_21',
  },
  networkinterfaces: {
    i18n: 'system.text_407',
  },
  guestimages: {
    i18n: 'system.text_408',
  },
  instance_snapshots: {
    i18n: 'system.text_409',
  },
  instancegroups: {
    i18n: 'dictionary.instancegroup',
  },
  dbinstances: {
    i18n: 'system.text_98',
  },
  dbinstanceaccounts: {
    i18n: 'common_574',
  },
  dbinstancedatabases: {
    i18n: 'common_575',
  },
  dbinstancebackups: {
    i18n: 'system.text_411',
  },
  elasticcaches: {
    i18n: 'dictionary.elasticcaches',
  },
  elasticcacheaccounts: {
    i18n: 'common_576',
  },
  elasticcacheacls: {
    i18n: 'common_577',
  },
  devtool_templates: {
    i18n: 'system.text_412',
  },
  ansibleplaybooks: {
    i18n: 'system.text_413',
  },
  servertemplates: {
    i18n: 'system.text_414',
  },
  globalvpcs: {
    i18n: 'system.text_415',
  },
  project_quotas: {
    i18n: 'system.text_416',
  },
  image_quotas: {
    i18n: 'system.text_44',
  },
  region_quotas: {
    i18n: 'system.text_417',
  },
  zone_quotas: {
    i18n: 'system.text_418',
  },
  quotas: {
    i18n: 'system.text_419',
  },
  domain_quotas: {
    i18n: 'system.text_45',
  },
  identity_quotas: {
    i18n: 'system.text_46',
  },
  infras_quotas: {
    i18n: 'system.text_47',
  },
  scalinggroups: {
    i18n: 'system.text_420',
  },
  scalingpolicies: {
    i18n: 'system.text_421',
  },
  policydefinitions: {
    i18n: 'system.text_422',
  },
  suggestsysalerts: {
    i18n: 'system.suggestsysalerts',
  },
  suggestsysrules: {
    i18n: 'system.suggestsysrules',
  },
  suggestsysruleconfigs: {
    i18n: 'system.suggestsysruleconfigs',
  },
  proxysettings: {
    i18n: 'system.text_425',
  },
  repos: {
    i18n: 'system.text_426',
  },
  storageclasses: {
    i18n: 'system.text_427',
  },
  nodes: {
    i18n: 'system.text_397',
  },
  kubecomponent: {
    i18n: 'system.text_428',
  },
  cloudevents: {
    i18n: 'common_707',
  },
  associate_bills: {
    i18n: 'system.text_394',
  },
  bill_conditions: {
    i18n: 'system.text_429',
  },
  scheduledtasks: {
    i18n: 'service.scheduledtask',
  },
  cloudgroups: {
    i18n: 'dictionary.cloudgroup',
  },
  cloudusers: {
    i18n: 'dictionary.clouduser',
  },
  cloudpolicies: {
    i18n: 'dictionary.cloudpolicy',
  },
  commonalerts: {
    i18n: 'dictionary.commonalert',
  },
  costalerts: {
    i18n: 'dictionary.costalerts',
  },
  dns_zones: {
    i18n: 'dictionary.dns_zone',
  },
  dns_recordsets: {
    i18n: 'dictionary.dns_recordsets',
  },
  rbacclusterroles: {
    i18n: 'dictionary.rbacclusterroles',
  },
  rbacclusterrolebindings: {
    i18n: 'dictionary.rbacclusterrolebindings',
  },
  federatednamespaces: {
    i18n: 'dictionary.federatednamespaces',
  },
  federatedroles: {
    i18n: 'dictionary.federatedroles',
  },
  federatedclusterroles: {
    i18n: 'dictionary.federatedclusterroles',
  },
  federatedrolebindings: {
    i18n: 'dictionary.federatedrolebindings',
  },
  federatedclusterrolebinds: {
    i18n: 'dictionary.federatedclusterrolebinds',
  },
  federatedclusterrolebindings: {
    i18n: 'dictionary.federatedclusterrolebindings',
  },
  alertresources: {
    i18n: 'dictionary.alertresource',
  },
  scopedpolicybindings: {
    i18n: 'res.scopedpolicybinding',
  },
  scopedpolicies: {
    i18n: 'res.scopedpolicy',
  },
  rds: {
    i18n: 'dictionary.dbinstances',
  },
  redis: {
    i18n: 'dictionary.elasticcache',
  },
  bucket: {
    i18n: 'dictionary.bucket',
  },
  unifiedmonitors: {
    i18n: 'dictionary.explorer',
  },
  guestdisks: {
    i18n: 'dictionary.guestdisk',
  },
  guestnetworks: {
    i18n: 'dictionary.guestnetwork',
  },
  guestsecgroups: {
    i18n: 'dictionary.guestsecgroup',
  },
  scalinggroupguests: {
    i18n: 'dictionary.scalinggroupguest',
  },
  baremetalnetworks: {
    i18n: 'dictionary.baremetalnetwork',
  },
  hoststorages: {
    i18n: 'dictionary.hoststorage',
  },
  hostwires: {
    i18n: 'dictionary.hostwire',
  },
  usages: {
    i18n: 'dictionary.usage',
  },
  alertrecords: {
    i18n: 'dictionary.alertrecord',
  },
  cloudevent: {
    i18n: 'dictionary.cloudevents',
  },
  access_groups: {
    i18n: 'dictionary.access_group',
  },
  access_group_rules: {
    i18n: 'dictionary.access_group_rule',
  },
  file_systems: {
    i18n: 'dictionary.filesystem',
  },
  mount_targets: {
    i18n: 'dictionary.mount_target',
  },
  projectmappings: {
    i18n: 'cloudenv.text_580',
  },
  exchange_rates: {
    i18n: 'dictionary.billing_exchange_rates',
  },
  webapps: {
    i18n: 'dictionary.webapp',
  },
  cachedloadbalancercertificates: {
    i18n: 'dictionary.cachedloadbalancercertificates',
  },
  proxy_endpoints: {
    i18n: 'network.ssh-proxy.endpoints',
  },
  proxy_matches: {
    i18n: 'network.ssh-proxy.endpoints',
  },
  proxy_agents: {
    i18n: 'network.ssh-proxy.proxyservice',
  },
  inter_vpc_networks: {
    i18n: 'dictionary.vpc_network',
  },
  inter_vpc_network_route_sets: {
    i18n: 'dictionary.inter_vpc_network_route_sets',
  },
  vpc_peering_connections: {
    i18n: 'dictionary.vpc_peer_connect',
  },
  diskbackups: {
    i18n: 'compute.disk_backup',
  },
  nodealerts: {
    i18n: 'dictionary.nodealerts',
  },
  cors: {
    i18n: 'storage.text_211',
  },
  policy: {
    i18n: 'compute.text_694',
  },
  samlusers: {
    i18n: 'user.sidepage.tab.samluser',
  },
  instancebackups: {
    i18n: 'compute.instance_backup',
  },
  elasticcachebackups: {
    i18n: 'dictionary.redis_backup',
  },
  mongodbs: {
    i18n: 'dictionary.mongodb',
  },
  elastic_searchs: {
    i18n: 'middleware.elasticsearch',
  },
  kafkas: {
    i18n: 'middleware.kafka',
  },
  storagecachedimages: {
    i18n: 'dictionary.storagecachedimages',
  },
  rolepolicies: {
    i18n: 'dictionary.rolepolicies',
  },
  'extra-users': {
    i18n: 'dictionary.extra_users',
  },
  topics: {
    i18n: 'dictionary.notify-topic',
  },
  notifyconfigs: {
    i18n: 'dictionary.mail_config',
  },
  robots: {
    i18n: 'dictionary.robot_manage',
  },
  subscribers: {
    i18n: 'dictionary.subscribers',
  },
  actions: {
    i18n: 'dictionary.actions',
  },
  alertrecordshields: {
    i18n: 'dictionary.alertrecordshields',
  },
  monitorresourcealerts: {
    i18n: 'dictionary.monitorresourcealerts',
  },
  monitorresources: {
    i18n: 'monitor.monitorresources',
  },
  bill_tags: {
    i18n: 'dictionary.bill_tags',
  },
  billsdimensions: {
    i18n: 'dictionary.billsdimensions',
  },
  cost_conversions: {
    i18n: 'dictionary.cost_conversions',
  },
  billing_exchange_rates: {
    i18n: 'dictionary.billing_exchange_rates',
  },
  price_infos: {
    i18n: 'dictionary.price_infos',
  },
  parameters: {
    i18n: 'dictionary.parameters',
  },
  services: {
    i18n: 'dictionary.services',
  },
  cdn_domains: {
    i18n: 'dictionary.cdn_domain',
  },
  cachedimages: {
    i18n: 'dictionary.storagecachedimages',
  },
  waf_instances: {
    i18n: 'dictionary.waf_instance',
  },
  shield_bills: {
    i18n: 'dictionary.shield_bills',
  },
  report_elements: {
    i18n: 'dictionary.report_elements',
  },
  report_settings: {
    i18n: 'dictionary.report_settings',
  },
  project_sharings: {
    i18n: 'dictionary.project_sharings',
  },
  billtasks: {
    i18n: 'dictionary.billtask',
  },
  backupstorages: {
    i18n: 'dictionary.backupstorage',
  },
  ipv6_gateways: {
    i18n: 'dictionary.ipv6_gateway',
  },
  tap_services: {
    i18n: 'dictionary.tap_service',
  },
  tap_flows: {
    i18n: 'dictionary.tap_flow',
  },
  tablestores: {
    i18n: 'dictionary.tablestore',
  },
  commandlogs: {
    i18n: 'dictionary.command_log',
  },
  isolated_device_models: {
    i18n: 'system.text_360',
  },
  predictions: {
    i18n: 'dictionary.predictions',
  },
  ext_resources: {
    i18n: 'dictionary.custom_data',
  },
  ext_resource_types: {
    i18n: 'dictionary.ext_resource_type',
  },
  month_reports: {
    i18n: 'dictionary.month_report',
  },
  daily_reports: {
    i18n: 'dictionary.daily_report',
  },
  scirptapplys: {
    i18n: 'system.scirptapplys',
  },
  scriptapplyrecords: {
    i18n: 'system.scriptapplyrecords',
  },
  meter_instances: {
    i18n: 'dictionary.meter_instance',
  },
  modelarts_pools: {
    i18n: 'ModelArts',
  },
  container_registries: {
    i18n: 'dictionary.container_registry',
  },
  organizations: {
    i18n: 'dictionary.organization',
  },
  ratesets: {
    i18n: 'dictionary.rateset',
  },
  block_accounts: {
    i18n: 'dictionary.block_account',
  },
  prices: {
    i18n: 'dictionary.price',
  },
  bill_alert_settings: {
    i18n: 'dictionary.bill_alert_setting',
  },
  bill_alerts: {
    i18n: 'dictionary.bill_alert',
  },
  reports: {
    i18n: 'dictionary.report',
  },
  bastion_hosts: {
    i18n: 'dictionary.bastion_host',
  },
  bastion_servers: {
    i18n: 'dictionary.bastion_server',
  },
  checks: {
    i18n: 'dictionary.check',
  },
  ...extraResources,
}

export const DEFAULT_ACTIONS_KEY = ['list', 'get', 'update', 'create', 'delete', 'perform']
