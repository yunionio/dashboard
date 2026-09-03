/**
 * 裸金属创建页草稿：scope + 页面零散字段。
 * disk：composite（仅 session）→ 同 tab 落盘/回填，跨 tab 不落盘不回填。
 */
export const BAREMETAL_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  CLOUDREGION_ZONE: 'cloudregionZone',
  OS_SELECT: 'osSelect',
  SPECIFICATIONS: 'specifications',
  DISK: 'disk',
  LOGIN_CONFIG: 'loginConfig',
  SERVER_NETWORK: 'serverNetwork',
  SCHED_POLICY: 'schedPolicy',
  IS_BONDING: 'isBonding',
}

export const BAREMETAL_CREATE_FORM_DRAFT_FC_BINDINGS = []

export function getBaremetalCreateFormDraftScope ({ type }) {
  if (!type) return ''
  return `compute.baremetal.${type}`
}

export const BAREMETAL_CREATE_FORM_DRAFT_FIELDS = Object.keys(BAREMETAL_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = BAREMETAL_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})
