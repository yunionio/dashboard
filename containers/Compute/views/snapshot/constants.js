import i18n from '@/locales'
export const CREATE_METHODS = {
  manual: i18n.t('compute.text_1063'),
  auto: i18n.t('compute.text_1064'),
}

export const DISK_TYPES = {
  sys: i18n.t('compute.text_49'),
  data: i18n.t('compute.text_50'),
  'swap-swap': i18n.t('compute.text_51'),
}

export const steadyStatus = {
  status: ['ready', 'create_failed'],
  guest_status: [undefined, 'running', 'on', 'rescue', 'ready', 'deallocated', 'unknown', 'suspend', 'converted', 'stopped', 'off', 'disk_reset_failed'],
  disk_status: [undefined, 'ready', 'running'],
}

export const STORAGE_TYPES = {
  local: i18n.t('compute.text_575'),
  baremetal: i18n.t('compute.text_604'),
  sheepdog: 'Sheepdog',
  rbd: 'Ceph',
  docker: i18n.t('compute.text_1065'),
  nas: 'NAS',
  vsan: 'vSAN',
  nfs: 'NFS',
  gpfs: 'GPFS',
  localstorage: i18n.t('compute.text_1066'),
  ceph: i18n.t('compute.text_79'),
}
