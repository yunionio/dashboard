/**
 * EIP 创建页草稿：scope + 页面零散选择类。
 */
export const EIP_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  IP_SUBNET: 'ipSubnet',
  BGP_TYPE: 'bgpType',
  CHARGE_TYPE: 'chargeType',
  CLOUDPROVIDER: 'cloudprovider',
}

export const EIP_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: EIP_CREATE_FORM_DRAFT_FIELD.CHARGE_TYPE, formField: 'charge_type', kind: 'selection' },
  { key: EIP_CREATE_FORM_DRAFT_FIELD.CLOUDPROVIDER, formField: 'manager', kind: 'selection' },
]

export function getEipCreateFormDraftScope ({ cloudEnv }) {
  if (!cloudEnv) return ''
  const type = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
  return `network.eip.${type}`
}

export const EIP_CREATE_FORM_DRAFT_FIELDS = Object.keys(EIP_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = EIP_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})
