
export default {
  server: {
    success: ['running'],
    info: ['ready', 'deallocated', 'unknown'],
    // danger: [new RegExp('fail')] // 这条会在 base组件 中默认存在
  },
  network: {
    info: ['unknown', 'unavailable'],
    success: ['available'],
    danger: ['deleted'],
  },
  host: {
    success: ['online', 'running'],
    info: ['offline', 'init'],
  },
  image: {
    info: ['ready', 'pending_delete'],
    success: ['active'],
    danger: ['killed'],
  },
  imageCache: {
    danger: ['delete_failed', 'cache_fail'],
    success: ['ready'],
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
  cloudaccount: {
    success: ['connected'],
    danger: ['disconnected'],
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
    info: ['init', 'unknown', 'unavailable'],
  },
  secgroupCache: {
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
    danger: ['delete_failed', 'restore_failed', 'failed', 'renew_failed', 'create_failed', 'reboot_failed', 'change_config_failed'],
    success: ['running'],
    info: ['unknown', 'unavailable', 'failed'],
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
}
