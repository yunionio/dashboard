/**
 * 裸金属创建页：控件级草稿 fieldKey 注册表
 *
 * formScope + fieldKey；复合控件值为嵌套对象。
 * 不落盘：name / description / reason / password / hostName / encrypt
 */
export const BAREMETAL_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  CLOUDREGION_ZONE: 'cloudregionZone',
  COUNT: 'count',
  OS_SELECT: 'osSelect',
  LOGIN_CONFIG: 'loginConfig',
  SERVER_NETWORK: 'serverNetwork',
  SCHED_POLICY: 'schedPolicy',
  IS_BONDING: 'isBonding',
  TAG: 'tag',
}

/** 页面 form.fc 简单字段 */
export const BAREMETAL_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: BAREMETAL_CREATE_FORM_DRAFT_FIELD.COUNT, formField: 'count' },
  { key: BAREMETAL_CREATE_FORM_DRAFT_FIELD.TAG, formField: '__meta__' },
]

export function getBaremetalCreateFormDraftScope ({ type }) {
  if (!type) return ''
  return `compute.baremetal.${type}`
}

/** 模板 :form-draft-key="baremetalDraftFields.xxx" */
export const BAREMETAL_CREATE_FORM_DRAFT_FIELDS = Object.keys(BAREMETAL_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = BAREMETAL_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})
