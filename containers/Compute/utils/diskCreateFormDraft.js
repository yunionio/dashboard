/**
 * 磁盘创建页草稿：scope + 页面零散选择类。输入类不绑。
 */
export const DISK_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  HYPERVISOR: 'hypervisor',
  CLOUDPROVIDER: 'cloudprovider',
  BACKEND: 'backend',
  STORAGE_ID: 'storageId',
}

export const DISK_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: DISK_CREATE_FORM_DRAFT_FIELD.CLOUDPROVIDER, formField: 'manager_id', kind: 'selection' },
]

export function getDiskCreateFormDraftScope ({ cloudEnv }) {
  if (!cloudEnv) return ''
  const type = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
  return `compute.disk.${type}`
}

export const DISK_CREATE_FORM_DRAFT_FIELDS = Object.keys(DISK_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = DISK_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})
