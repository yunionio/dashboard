/**
 * 虚拟机创建页：控件级草稿 fieldKey 注册表
 *
 * formScope + fieldKey；复合控件值为嵌套对象。
 * 不落盘：name / description / reason / password / loginPassword / keypair 材料 / encrypt_keys / hostName
 */
export const VM_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  CLOUDREGION_ZONE: 'cloudregionZone',
  AREA_SELECTS: 'areaSelects',
  CLOUDPROVIDER: 'cloudprovider',
  HYPERVISOR: 'hypervisor',
  OS_ARCH: 'osArch',
  VCPU: 'vcpu',
  VMEM: 'vmem',
  SKU: 'sku',
  COUNT: 'count',
  DURATION: 'duration',
  BILL: 'bill',
  OS_SELECT: 'osSelect',
  KICKSTART: 'kickstart',
  DEPLOY_TELEGRAF: 'deployTelegraf',
  SYSTEM_DISK: 'systemDisk',
  DATA_DISK: 'dataDisk',
  LOGIN_CONFIG: 'loginConfig',
  SERVER_NETWORK: 'serverNetwork',
  TAG: 'tag',
  EIP: 'eip',
  SECGROUP: 'secgroup',
  SCHED_POLICY: 'schedPolicy',
  BIOS: 'bios',
  VDI: 'vdi',
  VGA: 'vga',
  MACHINE: 'machine',
  BACKUP: 'backup',
  IS_DAEMON: 'isDaemon',
  INSTANCE_GROUPS: 'instanceGroups',
  PCI: 'pci',
  CUSTOM_DATA: 'customData',
  BASTION_HOST: 'bastionHost',
  ADVANCE_CONFIG_OPEN: 'advanceConfigOpen',
  ENABLE_WORLD_MAP: 'enableWorldMap',
}

/**
 * 页面 form.fc 简单字段（改值走 onValuesChange → sync）
 * types 缺省 = 全环境
 */
export const VM_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: VM_CREATE_FORM_DRAFT_FIELD.COUNT, formField: 'count' },
  { key: VM_CREATE_FORM_DRAFT_FIELD.CLOUDPROVIDER, formField: 'cloudprovider' },
  { key: VM_CREATE_FORM_DRAFT_FIELD.ENABLE_WORLD_MAP, formField: 'enableWorldMap', types: ['public'] },
  { key: VM_CREATE_FORM_DRAFT_FIELD.DEPLOY_TELEGRAF, formField: 'deploy_telegraf', types: ['idc'] },
  { key: VM_CREATE_FORM_DRAFT_FIELD.IS_DAEMON, formField: 'is_daemon', types: ['idc'] },
  { key: VM_CREATE_FORM_DRAFT_FIELD.BIOS, formField: 'bios', types: ['idc'] },
  { key: VM_CREATE_FORM_DRAFT_FIELD.VDI, formField: 'vdi', types: ['idc'] },
  { key: VM_CREATE_FORM_DRAFT_FIELD.VGA, formField: 'vga', types: ['idc'] },
  { key: VM_CREATE_FORM_DRAFT_FIELD.MACHINE, formField: 'machine', types: ['idc'] },
]

export function getVmCreateFormDraftScope ({ type, isServertemplate }) {
  if (!type) return ''
  return isServertemplate
    ? `compute.servertemplate.${type}`
    : `compute.server.${type}`
}

/** 模板 :form-draft-key="vmDraftFields.xxx" */
export const VM_CREATE_FORM_DRAFT_FIELDS = Object.keys(VM_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = VM_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})
