/**
 * EIP 创建页：控件级草稿 fieldKey 注册表
 *
 * formScope + fieldKey；复合控件值为嵌套对象。
 * 不落盘：name / description / password
 */
export const EIP_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  AREA_SELECTS: 'areaSelects',
  ENABLE_WORLD_MAP: 'enableWorldMap',
  IP_SUBNET: 'ipSubnet',
  BGP_TYPE: 'bgpType',
  CHARGE_TYPE: 'chargeType',
  BANDWIDTH: 'bandwidth',
  CLOUDPROVIDER: 'cloudprovider',
  TAG: 'tag',
}

/**
 * 页面 form.fc 简单字段（改值走 onValuesChange → sync）
 * types 缺省 = 全环境（idc/public/private）
 */
export const EIP_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: EIP_CREATE_FORM_DRAFT_FIELD.ENABLE_WORLD_MAP, formField: 'enableWorldMap', types: ['public'] },
  { key: EIP_CREATE_FORM_DRAFT_FIELD.BGP_TYPE, formField: 'bgp_type' },
  { key: EIP_CREATE_FORM_DRAFT_FIELD.CHARGE_TYPE, formField: 'charge_type' },
  { key: EIP_CREATE_FORM_DRAFT_FIELD.BANDWIDTH, formField: 'bandwidth' },
  { key: EIP_CREATE_FORM_DRAFT_FIELD.CLOUDPROVIDER, formField: 'manager' },
]

export function getEipCreateFormDraftScope ({ cloudEnv }) {
  if (!cloudEnv) return ''
  const type = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
  return `network.eip.${type}`
}

/** 模板 :form-draft-key="eipDraftFields.xxx" */
export const EIP_CREATE_FORM_DRAFT_FIELDS = Object.keys(EIP_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = EIP_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})
