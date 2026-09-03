/**
 * 虚拟机创建页草稿：scope + 页面零散 FC 绑定。组件传 form-draft-key 自管回填。
 */
export const VM_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  CLOUDREGION_ZONE: 'cloudregionZone',
  CLOUDPROVIDER: 'cloudprovider',
  HYPERVISOR: 'hypervisor',
  OS_ARCH: 'osArch',
  VCPU: 'vcpu',
  VMEM: 'vmem',
  SKU: 'sku',
  DURATION: 'duration',
  BILL: 'bill',
  OS_SELECT: 'osSelect',
  DEPLOY_TELEGRAF: 'deployTelegraf',
  SYSTEM_DISK: 'systemDisk',
  DATA_DISK: 'dataDisk',
  LOGIN_CONFIG: 'loginConfig',
  SERVER_NETWORK: 'serverNetwork',
  EIP: 'eip',
  SCHED_POLICY: 'schedPolicy',
  BIOS: 'bios',
  VDI: 'vdi',
  VGA: 'vga',
  MACHINE: 'machine',
  BACKUP: 'backup',
  IS_DAEMON: 'isDaemon',
  PCI: 'pci',
  ENCRYPT_KEYS: 'encryptKeys',
  BASTION_HOST: 'bastionHost',
}

/** 页面零散 form.fc 选择类字段 */
export const VM_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: VM_CREATE_FORM_DRAFT_FIELD.CLOUDPROVIDER, formField: 'cloudprovider', kind: 'selection' },
  { key: VM_CREATE_FORM_DRAFT_FIELD.DEPLOY_TELEGRAF, formField: 'deploy_telegraf', types: ['idc'], kind: 'selection' },
  { key: VM_CREATE_FORM_DRAFT_FIELD.IS_DAEMON, formField: 'is_daemon', types: ['idc'], kind: 'selection' },
]

export function getVmCreateFormDraftScope ({ type, isServertemplate }) {
  if (!type) return ''
  return isServertemplate
    ? `compute.servertemplate.${type}`
    : `compute.server.${type}`
}

export const VM_CREATE_FORM_DRAFT_FIELDS = Object.keys(VM_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = VM_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})
