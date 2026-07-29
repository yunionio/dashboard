/**
 * 平台级创建表单配置记忆（create form draft）
 *
 * ## 接入约定
 * 1. formScope：全局唯一，建议 `{product}.{resource}[.{env}][.{variant}]`
 *    例：compute.server.idc / compute.scaling_group
 * 2. 恢复模式：
 *    - A（级联）：提供 serialize + applyDraft，payload 尽量对齐该页 initFormData
 *    - B（平铺）：提供 draftFields，选项就绪后 setFieldsValue
 * 3. 工单 / 路由预填场景 must 禁用读写：shouldUseCreateDraft === false
 * 4. 有可用草稿回填时再关闭 DomainProject / OsSelect 等旧局部记忆（ignoreStorage）；
 *    无草稿或功能关闭时保留原先局部回填，避免双源抢填
 * 5. 开关仅全局一份 CREATE_FORM_DRAFT_SWITCHES（业务页勿再配），同时管写入与恢复：
 *    - saveOnChange：用户修改过程中是否防抖保存
 *    - saveOnSubmitSuccess：表单提交成功后是否保存
 *    - 二者皆 false 时：不写入、不恢复
 * 6. 读/写任一草稿时会扫描整包，清理全部过期条目（TTL）
 *
 * ## 存包结构（单一 localStorage key，便于统一清理）
 * key: __oc_create_form_draft__
 * value: {
 *   version: 1,
 *   forms: {
 *     'compute.server.idc': { savedAt, data },
 *     'compute.scaling_group': { savedAt, data },
 *     ...
 *   }
 * }
 * 清理全部：clearAllDrafts() 或 storage.remove('__oc_create_form_draft__')
 *
 * 详见 mixin：@/mixins/createFormDraft
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
 * 全局开关（唯一配置源，默认均开启；同时管写入与恢复）
 * - saveOnChange：用户修改过程中防抖写入
 * - saveOnSubmitSuccess：表单提交成功后写入
 * - 二者皆 false：功能关闭（不写不恢复）
 */
export const CREATE_FORM_DRAFT_SWITCHES = {
  saveOnChange: false,
  saveOnSubmitSuccess: true,
}

/**
 * 草稿功能是否启用（至少开一项写入开关才允许恢复）
 * @returns {boolean}
 */
export function isCreateFormDraftEnabled () {
  return !!(CREATE_FORM_DRAFT_SWITCHES.saveOnChange || CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess)
}

/**
 * 默认不持久化的「身份 / 敏感」字段（每次创建通常要改，或不应落盘）
 * 业务可通过 omitKeys 追加
 */
export const DEFAULT_OMIT_KEYS = [
  'name',
  'generate_name',
  'hostname',
  'hostName',
  'description',
  'reason',
  '__count__',
  'count',
  'password',
  'loginPassword',
  'keypair',
  'reset_password',
]

/**
 * 路由上出现这些 query 时视为「预填入口」（如从镜像创建），禁用 draft 读写，
 * 避免覆盖明确的入口意图
 */
export const DEFAULT_PREFILL_QUERY_KEYS = [
  'sence',
  'imageId',
  'imageOs',
  'imageType',
]

/**
 * 返回统一存储 key（不再按 formScope 拆 key）
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
  if (entry.data == null || typeof entry.data !== 'object') return true
  if (entry.savedAt && (Date.now() - entry.savedAt > DRAFT_TTL_MS)) return true
  return false
}

/**
 * 扫描整包，删除全部过期/无效条目；若有变更则写回（forms 空则删 key）
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
 * 读出整包；版本不符则清空并返回空壳；顺带清理过期条目
 * @returns {{ version: number, forms: Object }}
 */
function readStore () {
  const raw = storage.get(DRAFT_STORAGE_KEY)
  if (!raw || typeof raw !== 'object') {
    return { version: DRAFT_VERSION, forms: {} }
  }
  if (raw.version !== DRAFT_VERSION || !raw.forms || typeof raw.forms !== 'object') {
    // 整包结构升级不兼容：直接丢掉，避免脏数据
    clearAllDrafts()
    return { version: DRAFT_VERSION, forms: {} }
  }
  return purgeExpiredDrafts(raw)
}

/**
 * 写回整包
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
 * 读取某一表单的草稿 data；过期或不存在返回 null
 * 读时会扫描整包清理全部过期条目
 * @param {string} formScope
 * @returns {object|null}
 */
export function getDraft (formScope) {
  if (!formScope) return null
  const store = readStore()
  const entry = store.forms[formScope]
  if (!entry || typeof entry !== 'object') return null
  if (entry.data == null || typeof entry.data !== 'object') return null
  return entry.data
}

/**
 * 写入某一表单的草稿（合并进统一 key 下的 forms[formScope]）
 * 写前会扫描整包清理全部过期条目
 * @param {string} formScope
 * @param {object} data 业务 payload（调用方宜先 omitIdentityFields）
 */
export function setDraft (formScope, data) {
  if (!formScope || data == null || typeof data !== 'object') return
  const store = readStore()
  store.forms[formScope] = {
    savedAt: Date.now(),
    data,
  }
  writeStore(store)
}

/**
 * 清除某一个 formScope 的草稿；forms 空了会删掉整个 key
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
 * 一键清空所有创建表单草稿（只删这一个 localStorage 字段）
 */
export function clearAllDrafts () {
  storage.remove(DRAFT_STORAGE_KEY)
}

/**
 * 列出当前已存的 formScope（调试 / 设置页展示用；会先清理过期）
 * @returns {string[]}
 */
export function listDraftScopes () {
  const store = readStore()
  return Object.keys(store.forms || {})
}

/**
 * 判断当前路由是否允许使用创建草稿
 * - 全局开关全关：禁用
 * - 有 query.workflow：工单修改，禁用
 * - 有预填类 query（镜像创建等）：禁用
 * - options.disableWhen 返回 true：业务自定义禁用（如 isInitForm、servertemplate）
 *
 * @param {object} route this.$route
 * @param {object} [options]
 * @param {string[]} [options.prefillQueryKeys] 追加/覆盖预填 query 列表
 * @param {function} [options.disableWhen] (route) => boolean
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

/** 就地删除对象上的指定 key（仅自身属性） */
function deleteKeys (obj, keys) {
  if (!obj || typeof obj !== 'object') return
  keys.forEach(k => {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      delete obj[k]
    }
  })
}

/**
 * 深拷贝后去掉身份/敏感字段，避免下次回填名称、数量、密码等
 * 顶层与 extraData 内同名 key 都会删
 *
 * @param {object} payload
 * @param {string[]} [omitKeys=DEFAULT_OMIT_KEYS]
 * @returns {object}
 */
export function omitIdentityFields (payload, omitKeys = DEFAULT_OMIT_KEYS) {
  if (!payload || typeof payload !== 'object') return payload
  let cloned
  try {
    cloned = JSON.parse(JSON.stringify(payload))
  } catch (e) {
    return payload
  }
  const keys = omitKeys && omitKeys.length ? omitKeys : DEFAULT_OMIT_KEYS
  deleteKeys(cloned, keys)
  if (cloned.extraData && typeof cloned.extraData === 'object') {
    deleteKeys(cloned.extraData, keys)
  }
  // 兼容误存的旧 hybrid { api, form }
  if (cloned.api && typeof cloned.api === 'object') {
    deleteKeys(cloned.api, keys)
    if (cloned.api.extraData && typeof cloned.api.extraData === 'object') {
      deleteKeys(cloned.api.extraData, keys)
    }
  }
  return cloned
}

/**
 * 模式 B（平铺表单）用：从源对象按白名单挑字段
 * @param {object} source 如 fc.getFieldsValue()
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
