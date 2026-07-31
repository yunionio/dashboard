/**
 * 平台级创建表单配置记忆（create form draft）— 仅控件级
 *
 * ## 存包结构（单一 localStorage key）
 * key: __oc_create_form_draft__
 * value: {
 *   version: 1,
 *   forms: {
 *     'compute.server.idc': {
 *       savedAt,
 *       components: {
 *         domainProject: { domain, project },
 *         sku: { name },
 *         advanceConfigOpen: true,
 *         ...
 *       },
 *     },
 *   }
 * }
 *
 * ## 约定
 * 1. 唯一 id = formScope + fieldKey
 * 2. 复合控件一个 fieldKey，值可嵌套
 * 3. 有 options：校验草稿仍可用再回填
 * 4. 工单 / 预填：shouldUseCreateDraft === false 时不读写
 */
import storage from '@/utils/storage'

/** 所有创建表单草稿共用的唯一 localStorage key */
export const DRAFT_STORAGE_KEY = '__oc_create_form_draft__'

/** @deprecated 兼容旧命名，等同 DRAFT_STORAGE_KEY */
export const DRAFT_KEY_PREFIX = DRAFT_STORAGE_KEY

/** 存包结构版本；破坏性变更时递增，整包会被丢弃 */
export const DRAFT_VERSION = 1

/** 单条草稿有效期（毫秒），默认 7 天 */
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * 全局开关（唯一配置源；同时管写入与恢复）
 * - saveOnChange：用户修改过程中是否写入（组件级）
 * - saveOnSubmitSuccess：表单提交成功后是否写入（flush）
 * - 二者皆 false：功能关闭（不写不恢复）
 */
export const CREATE_FORM_DRAFT_SWITCHES = {
  saveOnChange: true,
  saveOnSubmitSuccess: true,
}

/**
 * 草稿功能是否启用
 * @returns {boolean}
 */
export function isCreateFormDraftEnabled () {
  return !!(CREATE_FORM_DRAFT_SWITCHES.saveOnChange || CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess)
}

/**
 * 路由上出现这些 query 时视为「预填入口」，禁用 draft 读写
 */
export const DEFAULT_PREFILL_QUERY_KEYS = [
  'sence',
  'imageId',
  'imageOs',
  'imageType',
]

/**
 * @returns {string}
 */
export function getDraftKey () {
  return DRAFT_STORAGE_KEY
}

/**
 * 判断单条是否过期或无效
 * @param {object} entry
 * @returns {boolean}
 */
function isDraftEntryExpired (entry) {
  if (!entry || typeof entry !== 'object') return true
  const hasComponents = entry.components && typeof entry.components === 'object' &&
    Object.keys(entry.components).length > 0
  if (!hasComponents) return true
  if (entry.savedAt && (Date.now() - entry.savedAt > DRAFT_TTL_MS)) return true
  return false
}

/**
 * @param {{ version: number, forms: Object }} store
 * @returns {{ version: number, forms: Object }}
 */
function purgeExpiredDrafts (store) {
  if (!store?.forms || typeof store.forms !== 'object') {
    return { version: DRAFT_VERSION, forms: {} }
  }
  let changed = false
  Object.keys(store.forms).forEach(scope => {
    if (isDraftEntryExpired(store.forms[scope])) {
      delete store.forms[scope]
      changed = true
    }
  })
  if (!Object.keys(store.forms).length) {
    if (changed) clearAllDrafts()
    return { version: DRAFT_VERSION, forms: {} }
  }
  if (changed) writeStore(store)
  return store
}

/**
 * @returns {{ version: number, forms: Object }}
 */
function readStore () {
  const raw = storage.get(DRAFT_STORAGE_KEY)
  if (!raw || typeof raw !== 'object') {
    return { version: DRAFT_VERSION, forms: {} }
  }
  if (raw.version !== DRAFT_VERSION || !raw.forms || typeof raw.forms !== 'object') {
    clearAllDrafts()
    return { version: DRAFT_VERSION, forms: {} }
  }
  return purgeExpiredDrafts(raw)
}

/**
 * @param {{ version: number, forms: Object }} store
 */
function writeStore (store) {
  try {
    storage.set(DRAFT_STORAGE_KEY, store)
  } catch (e) {
    // localStorage 满或 disabled：静默失败
  }
}

/**
 * 读取某一 formScope 下的 entry
 * @param {string} formScope
 * @returns {object|null}
 */
export function getDraftEntry (formScope) {
  if (!formScope) return null
  const store = readStore()
  const entry = store.forms[formScope]
  if (!entry || typeof entry !== 'object') return null
  return entry
}

/**
 * 读取某一控件草稿
 * @param {string} formScope 如 compute.server.idc
 * @param {string} fieldKey 如 domainProject / advanceConfigOpen
 * @returns {*|null}
 */
export function getComponentDraft (formScope, fieldKey) {
  if (!formScope || !fieldKey) return null
  const entry = getDraftEntry(formScope)
  if (!entry?.components || typeof entry.components !== 'object') return null
  if (!Object.prototype.hasOwnProperty.call(entry.components, fieldKey)) return null
  const val = entry.components[fieldKey]
  return val === undefined ? null : val
}

/** @see getComponentDraft */
export const getFieldDraft = getComponentDraft

/**
 * 写入某一控件草稿（合并进 forms[formScope].components）
 * @param {string} formScope
 * @param {string} fieldKey
 * @param {*} data
 */
export function setComponentDraft (formScope, fieldKey, data) {
  if (!formScope || !fieldKey) return
  if (data === undefined) return
  const store = readStore()
  const prev = store.forms[formScope] || {}
  const components = {
    ...(prev.components && typeof prev.components === 'object' ? prev.components : {}),
    [fieldKey]: data,
  }
  store.forms[formScope] = {
    savedAt: Date.now(),
    components,
  }
  writeStore(store)
}

/** @see setComponentDraft */
export const setFieldDraft = setComponentDraft

/**
 * 清除某一个控件草稿
 * @param {string} formScope
 * @param {string} fieldKey
 */
export function clearComponentDraft (formScope, fieldKey) {
  if (!formScope || !fieldKey) return
  const store = readStore()
  const entry = store.forms[formScope]
  if (!entry?.components || !Object.prototype.hasOwnProperty.call(entry.components, fieldKey)) return
  const components = { ...entry.components }
  delete components[fieldKey]
  if (!Object.keys(components).length) {
    clearDraft(formScope)
    return
  }
  store.forms[formScope] = {
    savedAt: Date.now(),
    components,
  }
  writeStore(store)
}

/** @see clearComponentDraft */
export const clearFieldDraft = clearComponentDraft

/**
 * 清除某一个 formScope 的草稿
 * @param {string} formScope
 */
export function clearDraft (formScope) {
  if (!formScope) return
  const store = readStore()
  if (!Object.prototype.hasOwnProperty.call(store.forms, formScope)) return
  delete store.forms[formScope]
  if (!Object.keys(store.forms).length) {
    clearAllDrafts()
    return
  }
  writeStore(store)
}

/**
 * 一键清空所有创建表单草稿
 */
export function clearAllDrafts () {
  storage.remove(DRAFT_STORAGE_KEY)
}

/**
 * @returns {string[]}
 */
export function listDraftScopes () {
  const store = readStore()
  return Object.keys(store.forms || {})
}

/**
 * 判断当前路由是否允许使用创建草稿
 * @param {object} route
 * @param {object} [options]
 * @returns {boolean}
 */
export function shouldUseCreateDraft (route, options = {}) {
  if (!isCreateFormDraftEnabled()) return false
  const q = route?.query || {}
  if (q.workflow) return false
  const prefillKeys = options.prefillQueryKeys || DEFAULT_PREFILL_QUERY_KEYS
  if (prefillKeys.some(k => q[k] != null && q[k] !== '')) return false
  if (typeof options.disableWhen === 'function' && options.disableWhen(route)) {
    return false
  }
  return true
}

/**
 * @param {object} source
 * @param {string[]} fields
 * @returns {object}
 */
export function pickFields (source, fields = []) {
  if (!source || typeof source !== 'object' || !fields.length) return {}
  const ret = {}
  fields.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      ret[key] = source[key]
    }
  })
  return ret
}

/**
 * options 中查找草稿偏好值；找不到返回 null（调用方走默认）
 * @param {Array} options
 * @param {*} preferred
 * @param {object} [opts]
 * @param {(item:*) => *} [opts.getId]
 * @returns {*|null}
 */
export function pickPreferredInOptions (options, preferred, opts = {}) {
  if (preferred == null || preferred === '') return null
  if (!Array.isArray(options) || !options.length) return null
  const getId = typeof opts.getId === 'function'
    ? opts.getId
    : (item) => (item && typeof item === 'object' ? (item.id ?? item.key ?? item) : item)
  const preferredId = (preferred && typeof preferred === 'object')
    ? (preferred.id ?? preferred.key)
    : preferred
  if (preferredId == null || preferredId === '') return null
  const hit = options.find(item => getId(item) === preferredId)
  return hit != null ? hit : null
}

/**
 * @param {*} obj
 * @param {string|string[]} path a.b / ['a','b']
 * @returns {*}
 */
export function getDraftValueByPath (obj, path) {
  if (obj == null) return undefined
  const keys = Array.isArray(path) ? path : String(path).split('.').filter(Boolean)
  if (!keys.length) return obj
  let cur = obj
  for (let i = 0; i < keys.length; i++) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[keys[i]]
  }
  return cur
}

/**
 * 不可变设置 path；返回新对象
 * @param {*} obj
 * @param {string|string[]} path
 * @param {*} value
 * @returns {*}
 */
export function setDraftValueByPath (obj, path, value) {
  const keys = Array.isArray(path) ? path : String(path).split('.').filter(Boolean)
  if (!keys.length) return value
  const root = (obj && typeof obj === 'object' && !Array.isArray(obj)) ? { ...obj } : {}
  let cur = root
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    const next = cur[k]
    cur[k] = (next && typeof next === 'object' && !Array.isArray(next)) ? { ...next } : {}
    cur = cur[k]
  }
  cur[keys[keys.length - 1]] = value
  return root
}

/**
 * 浅合并草稿对象（非对象则直接用 next）
 * @param {*} prev
 * @param {*} next
 * @returns {*}
 */
export function mergeDraftValue (prev, next) {
  if (next === undefined) return prev
  if (
    prev && typeof prev === 'object' && !Array.isArray(prev) &&
    next && typeof next === 'object' && !Array.isArray(next)
  ) {
    return { ...prev, ...next }
  }
  return next
}
