/**
 * 容器主机创建页：控件级草稿 fieldKey 注册表
 *
 * formScope + fieldKey；复合控件值为嵌套对象。
 * 不落盘：name / description / reason / password / hostName / encrypt
 */
export const CONTAINER_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  CLOUDREGION_ZONE: 'cloudregionZone',
  OS_ARCH: 'osArch',
  VCPU: 'vcpu',
  VMEM: 'vmem',
  SKU: 'sku',
  COUNT: 'count',
  DURATION: 'duration',
  DATA_DISK: 'dataDisk',
  SERVER_NETWORK: 'serverNetwork',
  TAG: 'tag',
  EIP: 'eip',
  SECGROUP: 'secgroup',
  SCHED_POLICY: 'schedPolicy',
  INSTANCE_GROUPS: 'instanceGroups',
  PCI: 'pci',
  ADVANCE_CONFIG_OPEN: 'advanceConfigOpen',
  /** 容器配置（SpecContainer 列表） */
  CONTAINERS: 'containers',
  /** 高级配置：端口映射 */
  PORT_MAPPING: 'portMapping',
}

/** 页面 form.fc 简单字段（改值走 onValuesChange → sync）；vcpu/vmem 由控件 options 就绪后回填 */
export const CONTAINER_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: CONTAINER_CREATE_FORM_DRAFT_FIELD.COUNT, formField: 'count' },
  { key: CONTAINER_CREATE_FORM_DRAFT_FIELD.VCPU, formField: 'vcpu', restore: false },
  { key: CONTAINER_CREATE_FORM_DRAFT_FIELD.VMEM, formField: 'vmem', restore: false },
]

export function getContainerCreateFormDraftScope ({ type }) {
  if (!type) return ''
  return `compute.container.${type}`
}

/** 模板 :form-draft-key="containerDraftFields.xxx" */
export const CONTAINER_CREATE_FORM_DRAFT_FIELDS = Object.keys(CONTAINER_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = CONTAINER_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})
