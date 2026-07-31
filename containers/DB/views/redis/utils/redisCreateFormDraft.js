/**
 * Redis 创建页：控件级草稿 fieldKey 注册表
 *
 * formScope: db.redis.create
 * 不落盘：generate_name / name / description / password / loginPassword / loginKeypair
 */
export const REDIS_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  BILLING_TYPE: 'billingType',
  DURATION: 'duration',
  COUNT: 'count',
  AREA_SELECTS: 'areaSelects',
  ENGINE: 'engine',
  ENGINE_VERSION: 'engineVersion',
  LOCAL_CATEGORY: 'localCategory',
  NODE_TYPE: 'nodeType',
  PERFORMANCE_TYPE: 'performanceType',
  MEMORY_SIZE_MB: 'memorySizeMb',
  SKU: 'sku',
  NETWORK: 'network',
  SECGROUP: 'secgroup',
}

export const REDIS_CREATE_FORM_DRAFT_SCOPE = 'db.redis.create'

/** 简单 form.fc 字段（bindFormFcFieldDraft） */
export const REDIS_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.BILLING_TYPE, formField: 'billing_type' },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.COUNT, formField: 'count' },
  // 以下由 Filters 在 options 就绪后回填
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.ENGINE, formField: 'engine', restore: false },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.ENGINE_VERSION, formField: 'engine_version', restore: false },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.LOCAL_CATEGORY, formField: 'local_category', restore: false },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.NODE_TYPE, formField: 'node_type', restore: false },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.PERFORMANCE_TYPE, formField: 'performance_type', restore: false },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.MEMORY_SIZE_MB, formField: 'memory_size_mb', restore: false },
  { key: REDIS_CREATE_FORM_DRAFT_FIELD.SKU, formField: 'sku', restore: false },
]

/** 模板 :form-draft-key="redisDraftFields.xxx" */
export const REDIS_CREATE_FORM_DRAFT_FIELDS = Object.keys(REDIS_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  map[REDIS_CREATE_FORM_DRAFT_FIELD[constKey]] = REDIS_CREATE_FORM_DRAFT_FIELD[constKey]
  return map
}, {})
