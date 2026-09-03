/**
 * 容器主机创建页草稿：scope。组件传 form-draft-key 自管回填。
 */
export const CONTAINER_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  CLOUDREGION_ZONE: 'cloudregionZone',
  OS_ARCH: 'osArch',
  VCPU: 'vcpu',
  VMEM: 'vmem',
  SKU: 'sku',
  DURATION: 'duration',
  DATA_DISK: 'dataDisk',
  SERVER_NETWORK: 'serverNetwork',
  EIP: 'eip',
  SCHED_POLICY: 'schedPolicy',
  PCI: 'pci',
}

export function getContainerCreateFormDraftScope ({ type }) {
  if (!type) return ''
  return `compute.container.${type}`
}

export const CONTAINER_CREATE_FORM_DRAFT_FIELDS = Object.keys(CONTAINER_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = CONTAINER_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})
