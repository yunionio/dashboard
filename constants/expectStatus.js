
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
    success: ['running'],
    danger: ['restart_failed', 'create_failed', 'change_failed', 'release_failed', 'error'],
    info: ['inactive', 'unknown', 'init', 'unavailable'],
  },
}
