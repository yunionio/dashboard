/**
 * RDS 创建页草稿：scope + 页面零散选择类；套餐级联由 Filters/SizeFilters/List 自管回填。
 * SYNC_FIELDS：flush-only selection（无 set，避免进页抢写打乱级联）。
 * duration（到期释放）：Duration 组件 form-draft-key 自管。
 * prepaidDuration / autoRenew：ClearingRadios 包年包月字段，页面 flush + billing_type 就绪后回填。
 */
export const RDS_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  BILLING_TYPE: 'billingType',
  DURATION: 'duration',
  PREPAID_DURATION: 'prepaidDuration',
  AUTO_RENEW: 'autoRenew',
  ENGINE: 'engine',
  ENGINE_VERSION: 'engineVersion',
  CATEGORY: 'category',
  STORAGE_TYPE: 'storageType',
  VCPU_COUNT: 'vcpuCount',
  VMEM_SIZE_MB: 'vmemSizeMb',
  ZONES: 'zones',
  SKU: 'sku',
  NETWORK: 'network',
}

export const RDS_CREATE_FORM_DRAFT_SCOPE = 'db.rds.create'

export const RDS_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: RDS_CREATE_FORM_DRAFT_FIELD.BILLING_TYPE, formField: 'billing_type', kind: 'selection' },
]

/** flush-only selection；回填由套餐组件 options 就绪后自管 */
export const RDS_CREATE_FORM_DRAFT_SYNC_FIELDS = [
  { key: RDS_CREATE_FORM_DRAFT_FIELD.ENGINE, formField: 'engine', kind: 'selection' },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.ENGINE_VERSION, formField: 'engine_version', kind: 'selection' },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.CATEGORY, formField: 'category', kind: 'selection' },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.STORAGE_TYPE, formField: 'storage_type', kind: 'selection' },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.VCPU_COUNT, formField: 'vcpu_count', kind: 'selection' },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.VMEM_SIZE_MB, formField: 'vmem_size_mb', kind: 'selection' },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.ZONES, formField: 'zones', kind: 'selection' },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.SKU, formField: 'sku', kind: 'selection' },
]

export const RDS_CREATE_FORM_DRAFT_FIELDS = Object.keys(RDS_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  map[RDS_CREATE_FORM_DRAFT_FIELD[constKey]] = RDS_CREATE_FORM_DRAFT_FIELD[constKey]
  return map
}, {})
