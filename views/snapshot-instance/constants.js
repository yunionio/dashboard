export const CREATE_METHODS = {
  manual: '手动创建',
  auto: '自动创建',
}

export const DISK_TYPES = {
  sys: '系统盘',
  data: '数据盘',
  'swap-swap': '分区',
}

export const steadyStatus = {
  status: ['ready', 'create_failed'],
  guest_status: [undefined, 'ready', 'running', 'deallocated', 'disk_reset_failed'],
  disk_status: [undefined, 'ready', 'running'],
}

export const STORAGE_TYPES = {
  local: '本地存储',
  baremetal: '物理机存储',
  sheepdog: 'Sheepdog',
  rbd: 'Ceph',
  docker: '容器存储',
  nas: 'NAS',
  vsan: 'vSAN',
  nfs: 'NFS',
  gpfs: 'GPFS',
  localstorage: '本地云盘',
  ceph: '共享云盘',
}
