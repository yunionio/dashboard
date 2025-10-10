const requireComponent = require.context('@scope', true, /expectStatus\.(js)$/)
const keys = requireComponent.keys().filter(item => {
  const arr = item.split('/')
  return arr[1] === 'constants' && /\.(js)$/.test(arr[2])
})
let extraStatus = {}
keys.forEach(fileName => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName)
  console.log('status', componentConfig)
  const { default: DEFAULT_STATUS = {} } = componentConfig
  extraStatus = { ...extraStatus, ...DEFAULT_STATUS }
})

export default {
  // 通用状态
  common: {
    success: ['available'],
    info: ['unknown'],
    danger: ['create_failed', 'delete_failed', 'update_tags_fail'],
  },
  server: {
    success: ['running', 'on', 'rescue'],
    info: ['ready', 'deallocated', 'unknown', 'suspend', 'converted', 'stopped', 'off'],
    // danger: [new RegExp('fail')] // 这条会在 base组件 中默认存在
  },
  serversshable: {
    success: ['available'],
    danger: ['unavailable', 'detect_failed'],
  },
  network: {
    info: ['unknown', 'unavailable'],
    success: ['available'],
    danger: ['deleted'],
  },
  reservedip: {
    info: ['offline', 'unknown'],
    success: ['online'],
  },
  wire: {
    success: ['available'],
    danger: ['merge_network_failed'],
  },
  host: {
    success: ['online', 'running'],
    info: ['offline', 'ready'],
    // danger: ['ready'],
  },
  image: {
    info: ['ready', 'pending_delete'],
    success: ['active'],
    danger: ['killed'],
  },
  imageCache: {
    danger: ['delete_failed', 'cache_fail'],
    success: ['ready', 'active'],
    info: ['init'],
  },
  expired: {
    success: [false],
    info: [true],
  },
  // 特殊状态，表示启用禁用
  enabled: {
    success: [true],
    info: [false],
  },
  // 特殊状态，表示host的服务状态
  host_status: {
    success: ['online'],
    info: ['offline'],
  },
  // 特殊状态，标识同步状态
  sync: {
    info: ['idle'],
    danger: ['error'],
  },
  cloudaccount: {
    success: ['connected'],
    danger: ['disconnected', 'deleted'],
    info: ['unknown'],
  },
  cloudaccountHealthStatus: {
    success: ['normal'],
    danger: ['insufficient', 'suspended', 'arrears'],
    info: ['unknown', 'no permission', 'pending'],
  },
  cloudaccountSyncStatus: {
    success: ['idle'],
  },
  redis: {
    success: ['running', 'RUNNING'],
    danger: ['restart_failed', 'create_failed', 'change_failed', 'release_failed', 'error'],
    info: ['inactive', 'unknown', 'init', 'unavailable'],
  },
  instanceGroup: {
    success: ['init'],
  },
  redisAccount: {
    success: ['available'],
    danger: ['create_failed', 'delete_failed'],
    info: ['unknown', 'unavailable'],
  },
  redisACL: {
    success: ['available'],
    danger: ['create_failed', 'delete_failed', 'update_failed'],
    info: ['unknown', 'unavailable'],
  },
  redisBackup: {
    success: ['success', 'running'],
    danger: ['failed', 'deleted', 'expired'],
    info: ['unknown', 'unavailable'],
  },
  sku: {
    success: ['ready', 'available'],
    danger: ['create_failed', 'delete_failed'],
    info: ['unknown', 'soldout'],
  },
  disk: {
    success: ['ready', 'post_migrate', 'ActiveSAS'],
    danger: ['alloc_failed', 'dealloc_failed', 'clone_failed', 'backup_alloc_failed', 'cancel_snapshot_failed'],
    info: ['unknown', 'unavailable'],
  },
  secgroupCache: {
    danger: ['delete_failed'],
    success: ['ready'],
    info: ['init'],
  },
  secgroup: {
    danger: ['delete_failed'],
    success: ['ready'],
    info: ['init'],
  },
  rdsAccount: {
    success: ['available'],
    danger: ['create_failed', 'delete_failed', 'reset_passwd_failed'],
    info: ['unknown', 'unavailable'],
  },
  rdsDatabase: {
    success: ['running'],
    danger: ['create_failed', 'deleted', 'delete_failed'],
    info: ['unknown', 'unavailable'],
  },
  rdsBackup: {
    success: ['ready'],
    danger: ['create_failed', 'deleted', 'delete_failed'],
    info: ['unknown', 'unavailable', 'failed'],
  },
  rds: {
    danger: ['delete_failed', 'restore_failed', 'failed', 'renew_failed', 'create_failed', 'reboot_failed', 'change_config_failed', 'isolate'],
    success: ['running'],
    info: ['unknown', 'unavailable'],
  },
  eip: {
    success: ['ready', 'running'],
    danger: ['allocate_fail', 'deallocate_fail', 'associate_fail', 'dissociate_fail'],
    info: ['unknown', 'stopped'],
  },
  snapshot: {
    success: ['available', 'ready'],
    danger: ['delete_failed', 'apply_failed', 'cancel_failed'],
    info: ['unknown'],
  },
  snapshotpolicy: {
    success: ['ready', 'available'],
    info: ['unknown', 'init'],
    danger: ['delete_failed'],
  },
  snapshotpolcyCache: {
    success: ['ready'],
    info: ['unknown', 'init'],
    danger: ['delete_failed'],
  },
  ansiblePlaybook: {
    success: ['succeeded'],
    info: ['unknown', 'init'],
    danger: ['failed', 'canceled'],
  },
  globalVpc: {
    success: ['available'],
    info: ['unknown', 'init'],
  },
  vpc: {
    success: ['available'],
    info: ['unavailable', 'unknown'],
    danger: ['failed'],
  },
  blockstorage: {
    info: ['offline', 'disabled', 'unmount'],
    success: ['online', 'enabled'],
    danger: ['failed', 'delete_failed'],
  },
  bucket: {
    info: ['unknown'],
    success: ['ready'],
    danger: ['create_fail', 'deleted', 'delete_fail'],
  },
  hostImageCache: {
    info: ['init', 'saving', 'caching', 'deleting'],
    success: ['ready', 'active'],
    danger: ['cache_fail'],
  },
  nat: {
    info: [],
    success: ['available'],
    danger: ['create_failed', 'delete_failed', 'dissociate_eip_failed', 'associate_eip_failed', 'set_auto_renew_failed', 'renew_failed'],
  },
  idp: {
    danger: ['disconnected'],
    success: ['connected'],
  },
  notification: {
    info: ['unknown'],
    success: ['received', 'sent', 'sent_ok'],
  },
  contact: {
    danger: ['init'],
    success: ['verified'],
  },
  workflowBiz: {
    success: ['success'],
  },
  billrate: {
    success: ['is_effective'],
    info: ['is_expire', 'is_not_effective', 'unknown'],
  },
  exchange_rate: {
    success: ['available'],
    info: ['expired', 'unavailable', 'unknown'],
  },
  scalinggroup: {
    success: ['ready'],
    danger: ['delete_failed', 'deleted'],
    info: ['init', 'unavailable', 'unknown'],
  },
  scalingpolicie: {
    success: ['ready'],
    danger: ['delete_failed', 'deleted', 'remove_failed', 'create_failed'],
    info: ['init', 'unavailable', 'unknown'],
  },
  scalingactivitie: {
    success: ['part_succeed', 'succeed'],
    danger: ['failed', 'delete_failed', 'deleted', 'reject'],
    info: ['init', 'unavailable', 'unknown'],
  },
  servertemplate: {
    success: ['ready'],
    info: ['init', 'unavailable', 'unknown'],
    danger: ['invalid'],
  },
  kubecluster: {
    success: ['running'],
    danger: ['error', 'create_fail', 'delete_fail', 'lost'],
    info: ['init', 'unknown'],
  },
  kubecluster_sync_status: {
    success: ['idle'],
    danger: ['error'],
    info: [],
  },
  kubemachines: {
    info: ['ready', 'init'],
    success: ['running'],
    danger: ['error', 'create_fail', 'prepare_fail', 'delete_fail', 'terminate_fail'],
  },
  k8s_resource: {
    success: ['Running', 'Succeeded', 'Complete', 'Bound', 'complated', 'Completed', 'active', 'Active'],
    danger: ['Failed', 'unBound'],
  },
  k8s_resource_job: {
    success: ['Complete'],
    danger: ['Failed'],
  },
  release: {
    success: ['deployed', 'created'],
    info: ['superseded'],
    danger: ['uninstalled', 'failed'],
  },
  tenant: {
    info: ['certificating', 'uncertified', 'unknown'],
    success: ['certified'],
    danger: ['denied'],
  },
  policydefinition: {
    success: ['ready'],
    info: ['init', 'unknown'],
  },
  scalingserver: {
    success: ['ready'],
    info: ['init', 'unknown'],
    danger: ['remove_failed'],
  },
  licence: {
    success: ['success'],
    danger: ['prohibited'],
    warning: ['exceeded'],
  },
  lb: {
    info: ['disabled'],
    success: ['enabled'],
    danger: [],
  },
  lbacl: {
    info: ['disabled'],
    success: ['enabled', 'available'],
    danger: [],
  },
  lbcert: {
    info: ['disabled'],
    success: ['enabled', 'available'],
    danger: [],
  },
  ipv6_gateway: {
    info: ['info', 'unknown'],
    success: ['running', 'available', 'enabled'],
    danger: [],
  },
  lbHealth: {
    info: ['off'],
    success: ['on'],
    danger: [''],
  },
  lbAcl: {
    info: ['off'],
    success: ['on'],
    danger: [''],
  },
  rate: {
    info: ['unavailable'],
    success: ['available'],
    danger: ['expired'],
  },
  severity: {
    info: ['Unknown'],
    success: ['OK'],
    danger: ['Critical'],
    warning: ['WARNING'],
  },
  kubecomponent: {
    info: ['init'],
    success: ['deployed'],
    danger: ['delete_fail', 'deploy_fail', 'update_fail'],
  },
  vmReleaseVirtualmachine: {
    info: [],
    success: ['Running'],
    danger: ['delete_fail', 'deploy_fail', 'update_fail', 'create_fail', 'Invalid'],
  },
  vmReleaseAnsibleplaybook: {
    info: [],
    success: ['Finished'],
    danger: ['delete_fail', 'deploy_fail', 'update_fail', 'create_fail'],
  },
  suggestsysalert: {
    info: ['ready'],
    success: ['resolved'],
    danger: ['delete_fail'],
  },
  reportProject: {
    info: ['init'],
    success: ['accept'],
    danger: ['refused', 'expired'],
  },
  lbRedirect: {
    info: [false, '', 'off'],
    success: ['raw'],
    danger: [],
  },
  scheduledtask: {
    success: ['ready'],
    danger: ['create_failed'],
  },
  scheduledtaskactivity: {
    info: ['execution'],
    success: ['succeed', 'part_succeed'],
    danger: ['failed', 'reject'],
  },
  scheduledtaskBillSync: {
    success: ['finished'],
  },
  cloudgroup: {
    info: 'unknown',
    success: ['available'],
  },
  clouduser: {
    info: 'unknown',
    success: ['available'],
  },
  commonalert: {
    info: [],
    success: ['ready'],
    danger: ['delete_fail', 'deleted'],
  },
  monitorresources: {
    success: ['attach'],
    danger: ['alerting', 'unknown'],
    info: ['init'],
  },
  idpAutoCreateUser: {
    success: [true],
    info: [false],
  },
  networIsAutoAlloc: {
    success: [true],
    info: [false],
  },
  bill: {
    success: ['init'],
    danger: ['overdue', 'arrears'],
  },
  dnszone: {
    success: ['available'],
    info: ['pending'],
  },
  alertrecord: {
    info: ['expired'],
    success: ['ok', 'effective'],
    danger: ['alerting'],
  },
  alertSendState: {
    info: [],
    success: ['ok', 'silent'],
    danger: [''],
  },
  alertresource: {
    success: ['ok'],
    danger: ['alerted', 'alerting'],
  },
  samluser: {
    success: ['available'],
  },
  externalproject: {
    success: ['available'],
    info: ['unavailable', 'unknown'],
  },
  nas: {
    success: ['available'],
    info: ['unavailable', 'unknown'],
    danger: ['delete_failed', 'create_failed'],
  },
  accessGroup: {
    success: ['available'],
    info: ['unknown'],
    danger: ['delete_failed', 'sync_rules_failed'],
  },
  accessGroupRule: {
    success: ['available'],
    info: ['unknown'],
    danger: ['delete_failed', 'create_failed'],
  },
  mountTarget: {
    success: ['available'],
    info: ['unavailable', 'unknown'],
    danger: ['delete_failed', 'create_failed'],
  },
  sshProxyEndpoints: {
    success: ['available'],
    info: ['unavailable', 'unknown'],
  },
  projectMapping: {
    success: ['available'],
  },
  waf: {
    success: ['available'],
    info: ['unavailable', 'unknown'],
    danger: ['delete_failed', 'create_failed'],
  },
  kafka: {
    success: ['available'],
    info: ['unknown', 'unavailable'],
    danger: ['delete_failed'],
  },
  elasticSearch: {
    success: ['available'],
    info: ['unknown', 'unavailable'],
    danger: ['delete_failed'],
  },
  webapp: {
    success: ['ready'],
    info: ['unknown'],
  },
  mongodb: {
    success: ['running'],
    info: ['unknown'],
    danger: ['delete_failed'],
  },
  mongodbBackup: {
    success: ['available'],
    info: ['unknown', 'unavailable'],
  },
  cdnDomain: {
    success: ['online'],
    info: ['unknown', 'offline'],
    danger: ['rejected', 'delete_failed'],
  },
  robot: {
    success: ['ready'],
    info: ['unknown'],
  },
  vpcNetwork: {
    success: ['available'],
    info: ['unknown'],
    danger: ['create_failed', 'delete_failed'],
  },
  routeSet: {
    success: ['available'],
    info: ['unknown', 'conflict', 'disabled'],
  },
  region: {
    success: ['inservice'],
    error: ['outofservice'],
  },
  routeTable: {
    success: ['available'],
    info: ['unknown', 'conflict', 'disabled'],
    danger: ['update_falied'],
  },
  vpcPeerConnect: {
    success: ['active'],
    info: ['unknown', 'pending-acceptance'],
    danger: ['create_failed', 'delete_failed'],
  },
  diskBackup: {
    success: ['ready'],
  },
  instanceBackup: {
    success: ['ready'],
    danger: ['save_failed'],
  },
  cpp: {
    success: ['assigned'],
    info: ['unknown', 'unassigned'],
  },
  backupStorage: {
    success: ['online'],
    info: ['init'],
    danger: ['offline'],
  },
  irsOrders: {
    success: ['all', 'hand'],
    warning: ['part'],
    info: ['process'],
    danger: ['resp_failed'],
  },
  tablestore: {
    success: ['running'],
  },
  modelarts: {
    success: ['running'],
  },
  remotefile: {
    success: ['running'],
  },
  disk_is_ssd: {
    success: [true],
    info: [false],
  },
  oss: {
    success: ['ready'],
  },
  dbAudit: {
    success: ['running'],
  },
  fortressAircraft: {
    success: ['running'],
  },
  wtps: {
    success: ['running'],
  },
  unifiedIds: {
    success: ['available'],
    danger: ['unsign'],
  },
  backup_sync: {
    success: ['ready'],
    danger: ['failed'],
  },
  billtasks: {
    success: ['done'],
    info: ['cancel', 'blocking_cancel'],
    danger: ['fail'],
  },
  k8s_repo: {
    success: ['init'],
  },
  reportTasks: {
    success: ['success'],
    info: ['cancel'],
    danger: ['failed'],
  },
  container: {
    success: ['running', 'on'],
    info: ['exited', 'ready', 'unknown', 'off'],
    danger: ['start_failed', 'probe_failed'],
  },
  phoneModel: {
    success: ['ready'],
  },
  phoneImage: {
    success: ['ready'],
  },
  webappDomains: {
    success: ['available'],
    danger: ['no_bind'],
  },
  parentTaskStatus: {
    success: ['done'],
    danger: ['failed'],
  },
  parentTaskStage: {
    success: ['complete'],
    danger: ['failed'],
  },
  pod: {
    info: ['stop'],
  },
  offlineExport: {
    danger: ['expired'],
    success: ['available'],
  },
  reportRecord: {
    danger: ['fail'],
    success: ['success'],
  },
  billProduct: {
    success: ['available'],
    danger: ['failed'],
  },
  sslCertificate: {
    success: ['active', 'available'],
    danger: ['failed', 'expired', 'create_failed'],
  },
  healthCheck: {
    success: ['available'],
    danger: ['create_failed'],
  },
  aiGateway: {
    success: ['available'],
    info: ['unknown'],
    danger: ['delete_failed', 'create_failed'],
  },
  ...extraStatus,
}
