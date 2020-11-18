
export default {
  server: {
    success: ['running'],
    info: ['ready', 'deallocated', 'unknown', 'suspend', 'converted'],
    // danger: [new RegExp('fail')] // 这条会在 base组件 中默认存在
  },
  network: {
    info: ['unknown', 'unavailable'],
    success: ['available'],
    danger: ['deleted'],
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
    info: ['unknown', 'no_permission'],
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
    success: ['ready'],
    danger: ['create_failed', 'delete_failed'],
    info: ['unknown'],
  },
  disk: {
    success: ['ready', 'post_migrate'],
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
    success: ['ready'],
    danger: ['allocate_fail', 'deallocate_fail', 'associate_fail', 'dissociate_fail'],
    info: ['unknown'],
  },
  snapshot: {
    success: ['ready'],
  },
  snapshotpolicy: {
    success: ['ready'],
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
    info: ['offline', 'disabled'],
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
    success: ['ready'],
    danger: ['cache_fail'],
  },
  nat: {
    info: [],
    success: ['available'],
    danger: ['create_fail', 'failed', 'delete_failed'],
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
    info: ['is_expire'],
    danger: ['is_not_effective'],
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
    danger: ['error', 'create_fail', 'delete_fail'],
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
    danger: ['delete_fail'],
  },
  reportProject: {
    info: ['init'],
    success: ['accept'],
    danger: ['refused', 'expired'],
  },
  lbRedirect: {
    info: ['off'],
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
  cloudgroup: {
    info: 'unknown',
    success: ['available'],
  },
  clouduser: {
    info: 'unknown',
    success: ['available'],
  },
  cloudgroupcache: {
    success: ['available'],
  },
  commonalert: {
    info: [],
    success: ['ready'],
    danger: ['delete_fail', 'deleted'],
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
  },
  alertrecord: {
    info: [],
    success: ['ok'],
    danger: ['alerting'],
  },
  dnszonecache: {
    success: ['available'],
  },
  alertresource: {
    success: [],
    danger: ['alerted'],
  },
  samluser: {
    success: ['available'],
  },
  externalproject: {
    success: ['available'],
    info: ['unavailable', 'unknown'],
  },
}
