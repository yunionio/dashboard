/**
 * Redis 创建页草稿：scope + 页面零散选择类；套餐级联由 ItemFilters 自管回填。
 * SYNC_FIELDS：flush-only selection（无 set，避免进页抢写打乱级联）。
 * duration（到期释放）：Duration 组件 form-draft-key 自管。
 * prepaidDuration / autoRenew：ClearingRadios 包年包月字段，页面 flush + billing_type 就绪后回填。
 */
export const REDIS_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  BILLING_TYPE: 'billingType',
  DURATION: 'duration',
  PREPAID_DURATION: 'prepaidDuration',
  AUTO_RENEW: 'autoRenew',
  ENGINE: 'engine',
  ENGINE_VERSION: 'engineVersion',
  LOCAL_CATEGORY: 'localCategory',
  NODE_TYPE: 'nodeType',
  PERFORMANCE_TYPE: 'performanceType',
  MEMORY_SIZE_MB: 'memorySizeMb',
  SKU: 'sku',
  NETWORK: 'network',
}

export const REDIS_CREATE_FORM_DRAFT_SCOPE = 'db.redis.create'

export const REDIS_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.BILLING_TYPE, formField: 'billing_type', kind: 'selection' },
]

/** flush-only selection；回填由套餐组件 options 就绪后自管 */
export const REDIS_CREATE_FORM_DRAFT_SYNC_FIELDS = [
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.ENGINE, formField: 'engine', kind: 'selection' },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.ENGINE_VERSION, formField: 'engine_version', kind: 'selection' },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.LOCAL_CATEGORY, formField: 'local_category', kind: 'selection' },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.NODE_TYPE, formField: 'node_type', kind: 'selection' },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.PERFORMANCE_TYPE, formField: 'performance_type', kind: 'selection' },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.MEMORY_SIZE_MB, formField: 'memory_size_mb', kind: 'selection' },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.SKU, formField: 'sku', kind: 'selection' },
]

export const REDIS_CREATE_FORM_DRAFT_FIELDS = Object.keys(REDIS_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  map[REDIS_CREATE_FORM_DRAFT_FIELD[constKey]] = REDIS_CREATE_FORM_DRAFT_FIELD[constKey]
  return map
}, {})
