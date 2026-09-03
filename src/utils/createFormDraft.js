/**
 * 创建表单控件级草稿（local + session）
 * 组件自管回填；页面传 form-draft-key / 管零散 field。
 * 页面进页后拆分 restore（回填）/ backup（备份）两开关；工单与预填仅关回填、仍可备份。
 */
import storage from '@/utils/storage'
import store from '@/store'
import { isCE } from '@/utils/utils'

/** 所有创建表单草稿共用的 localStorage key（选择类字段） */
export const DRAFT_STORAGE_KEY = '__oc_create_form_draft__'

/** 会话级草稿 key（全量字段，同 tab 有效） */
export const SESSION_DRAFT_STORAGE_KEY = '__oc_create_form_session_draft__'

/** 标记当前 JS 运行时是否拥有本 tab 的 session 草稿（用于识别「复制标签页」） */
const SESSION_TAB_OWNER_KEY = '__oc_create_form_session_tab_owner__'

/** 草稿字段类型 */
export const DRAFT_KIND = {
  /** 选择类：radio-button / 单选 select / switch / 级联，local + session 双写、可回填 */
  SELECTION: 'selection',
  /** 输入类：文本 / 数字 / 密码 / textarea，仅 session 写入、回填时跳过 */
  INPUT: 'input',
  /** 复合控件：仅 session 写入、可回填（内部输入子字段按白名单跳过） */
  COMPOSITE: 'composite',
}

/** 存包结构版本；破坏性变更时递增，旧版整包丢弃、不做迁移 */
export const DRAFT_VERSION = 2

/** 单条草稿有效期（毫秒），默认 30 天 */
export const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000

/**
 * 全局开关（唯一配置源；仅由 resolveCreateFormDraftFlags 读取后下发页面）
 * - saveOnSubmitSuccess：表单校验通过后是否写入（flush，不等待接口成功）
 * - false：功能关闭（不写不恢复）
 * - 开源版（isCE / isSysCE）：强制关闭，与开关无关
 * 子组件勿直接 import 本对象，应使用页面 provide 的 backupOnSubmit
 */
export const CREATE_FORM_DRAFT_SWITCHES = {
  saveOnSubmitSuccess: true,
}

/**
 * 草稿功能是否启用（开源版强制关闭；否则看 CREATE_FORM_DRAFT_SWITCHES）
 * @returns {boolean}
 */
export function isCreateFormDraftEnabled () {
  if (isCE() || store.getters.isSysCE) return false
  return !!CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess
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
 * @param {string} [storageKey]
 * @returns {{ version: number, forms: Object }}
 */
function purgeExpiredDrafts (store, storageKey = DRAFT_STORAGE_KEY) {
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
    if (changed) clearAllDrafts(storageKey)
    return { version: DRAFT_VERSION, forms: {} }
  }
  if (changed) writeStore(store, storageKey)
  return store
}

/**
 * 按存储 key 解析后端：session key 用 sessionStorage，其余用 localStorage
 * @param {string} storageKey
 * @returns {object} storage api（含 session）
 */
function resolveStorageBackend (storageKey) {
  return storageKey === SESSION_DRAFT_STORAGE_KEY ? storage.session : storage
}

/**
 * @param {string} [storageKey]
 * @returns {{ version: number, forms: Object }}
 */
function readStore (storageKey = DRAFT_STORAGE_KEY) {
  const backend = resolveStorageBackend(storageKey)
  const raw = backend.get(storageKey)
  if (!raw || typeof raw !== 'object') {
    return { version: DRAFT_VERSION, forms: {} }
  }
  if (raw.version !== DRAFT_VERSION || !raw.forms || typeof raw.forms !== 'object') {
    // 版本不匹配（含 v1）或结构无效：整包删除，不尝试迁移
    clearAllDrafts(storageKey)
    return { version: DRAFT_VERSION, forms: {} }
  }
  return purgeExpiredDrafts(raw, storageKey)
}

/**
 * @param {{ version: number, forms: Object }} store
 * @param {string} [storageKey]
 */
function writeStore (store, storageKey = DRAFT_STORAGE_KEY) {
  try {
    resolveStorageBackend(storageKey).set(storageKey, {
      version: DRAFT_VERSION,
      forms: (store?.forms && typeof store.forms === 'object') ? store.forms : {},
    })
  } catch (e) {
    // localStorage/sessionStorage 满或 disabled：静默失败
  }
}

/**
 * 读取某一 formScope 下的 entry
 * @param {string} formScope
 * @param {string} [storageKey]
 * @returns {object|null}
 */
export function getDraftEntry (formScope, storageKey) {
  if (!isCreateFormDraftEnabled()) return null
  if (!formScope) return null
  const store = readStore(storageKey)
  const entry = store.forms[formScope]
  if (!entry || typeof entry !== 'object') return null
  return entry
}

/**
 * 读取某一控件草稿
 * @param {string} formScope 如 compute.server.idc
 * @param {string} fieldKey 如 domainProject / systemDisk
 * @param {string} [storageKey]
 * @returns {*|null}
 */
export function getComponentDraft (formScope, fieldKey, storageKey) {
  if (!formScope || !fieldKey) return null
  const entry = getDraftEntry(formScope, storageKey)
  if (!entry?.components || typeof entry.components !== 'object') return null
  if (!Object.prototype.hasOwnProperty.call(entry.components, fieldKey)) return null
  const val = entry.components[fieldKey]
  return val === undefined ? null : val
}

/**
 * 写入某一控件草稿（合并进 forms[formScope].components）
 * @param {string} formScope
 * @param {string} fieldKey
 * @param {*} data
 * @param {string} [storageKey]
 */
export function setComponentDraft (formScope, fieldKey, data, storageKey) {
  if (!isCreateFormDraftEnabled()) return
  if (!formScope || !fieldKey) return
  if (data === undefined) return
  const store = readStore(storageKey)
  const prev = store.forms[formScope] || {}
  const components = {
    ...(prev.components && typeof prev.components === 'object' ? prev.components : {}),
    [fieldKey]: data,
  }
  store.forms[formScope] = {
    savedAt: Date.now(),
    components,
  }
  writeStore(store, storageKey)
}

/**
 * 清除某一个控件草稿
 * @param {string} formScope
 * @param {string} fieldKey
 * @param {string} [storageKey]
 */
export function clearComponentDraft (formScope, fieldKey, storageKey) {
  if (!formScope || !fieldKey) return
  const store = readStore(storageKey)
  const entry = store.forms[formScope]
  if (!entry?.components || !Object.prototype.hasOwnProperty.call(entry.components, fieldKey)) return
  const components = { ...entry.components }
  delete components[fieldKey]
  if (!Object.keys(components).length) {
    clearDraft(formScope, storageKey)
    return
  }
  store.forms[formScope] = {
    savedAt: Date.now(),
    components,
  }
  writeStore(store, storageKey)
}

/**
 * 清除某一个 formScope 的草稿
 * @param {string} formScope
 * @param {string} [storageKey]
 */
export function clearDraft (formScope, storageKey) {
  if (!formScope) return
  const store = readStore(storageKey)
  if (!Object.prototype.hasOwnProperty.call(store.forms, formScope)) return
  delete store.forms[formScope]
  if (!Object.keys(store.forms).length) {
    clearAllDrafts(storageKey)
    return
  }
  writeStore(store, storageKey)
}

/**
 * 一键清空指定后端的创建表单草稿
 * @param {string} [storageKey]
 */
export function clearAllDrafts (storageKey = DRAFT_STORAGE_KEY) {
  resolveStorageBackend(storageKey).remove(storageKey)
}

/**
 * 复制标签页会克隆 sessionStorage。Chrome/Firefox 常把复制报成 navigation type = back_forward，
 * 不能靠 type 区分「真后退」与「复制」。
 *
 * 做法：session 内放 tab guard；正常离开用 pagehide（非 bfcache）清掉；
 * 复制不会触发源 tab 的 pagehide，新 tab 仍带着 guard → 清空 session 草稿。
 * 刷新：pagehide 清 guard 后 reload，无 guard → 保留 session。
 * 每个 JS 运行时只执行一次。
 * @returns {boolean} 是否判定为复制/继承 session 并已清空
 */
export function ensureCreateFormSessionTabIsolation () {
  if (typeof window === 'undefined') return false
  if (window.__OC_CREATE_FORM_SESSION_TAB_ISOLATION_DONE__) {
    return !!window.__OC_CREATE_FORM_SESSION_TAB_INHERITED__
  }
  window.__OC_CREATE_FORM_SESSION_TAB_ISOLATION_DONE__ = true

  const claimGuard = () => {
    const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`
    try { window.sessionStorage.setItem(SESSION_TAB_OWNER_KEY, id) } catch (e) { /* ignore */ }
    return id
  }

  // 正常离开 / 刷新：清掉 guard。复制标签页不会走源 tab 的 pagehide，克隆里仍保留 guard。
  // bfcache（persisted）不清，避免真·后退误伤。
  if (!window.__OC_CREATE_FORM_SESSION_TAB_GUARD_BOUND__) {
    window.__OC_CREATE_FORM_SESSION_TAB_GUARD_BOUND__ = true
    window.addEventListener('pagehide', (e) => {
      if (e && e.persisted) return
      try { window.sessionStorage.removeItem(SESSION_TAB_OWNER_KEY) } catch (err) { /* ignore */ }
    })
  }

  let navType = 'navigate'
  try {
    const entry = typeof performance !== 'undefined' &&
      performance.getEntriesByType &&
      performance.getEntriesByType('navigation')[0]
    if (entry && entry.type) {
      navType = entry.type
    } else if (typeof performance !== 'undefined' && performance.navigation) {
      const t = performance.navigation.type
      navType = t === 1 ? 'reload' : (t === 2 ? 'back_forward' : 'navigate')
    }
  } catch (e) { /* ignore */ }

  let guard = null
  try {
    guard = window.sessionStorage.getItem(SESSION_TAB_OWNER_KEY)
  } catch (e) {
    window.__OC_CREATE_FORM_SESSION_TAB_INHERITED__ = false
    return false
  }

  // 刷新：pagehide 已清 guard，保留 session 草稿
  if (navType === 'reload') {
    claimGuard()
    window.__OC_CREATE_FORM_SESSION_TAB_INHERITED__ = false
    return false
  }

  // 仍带着 guard → 复制标签页（或未正常卸载的克隆）；清空 session 草稿，走跨 tab / local
  if (guard) {
    try {
      clearAllDrafts(SESSION_DRAFT_STORAGE_KEY)
      window.sessionStorage.removeItem(SESSION_DRAFT_STORAGE_KEY)
    } catch (e) { /* ignore */ }
    claimGuard()
    window.__OC_CREATE_FORM_SESSION_TAB_INHERITED__ = true
    return true
  }

  // 真·后退/前进或首次进入：无 guard，保留已有 session 草稿
  claimGuard()
  window.__OC_CREATE_FORM_SESSION_TAB_INHERITED__ = false
  return false
}

/**
 * 是否阻断草稿回填（工单 / 页面 disableWhen）
 * 全局开关开启时，这些场景仍可备份，只是不回填。
 * 镜像等预填 query（imageId/imageOs…）不在此整页阻断，由对应组件局部互斥（如 OsSelect）。
 * 若某页确需按 query 整页关回填，可显式传 options.prefillQueryKeys。
 * @param {object} route
 * @param {object} [options]
 * @returns {boolean}
 */
export function isCreateFormDraftRestoreBlocked (route, options = {}) {
  const q = route?.query || {}
  if (q.workflow) return true
  const prefillKeys = Array.isArray(options.prefillQueryKeys) ? options.prefillQueryKeys : []
  if (prefillKeys.some(k => q[k] != null && q[k] !== '')) return true
  if (typeof options.disableWhen === 'function' && options.disableWhen(route)) {
    return true
  }
  return false
}

/**
 * 页面进入后草稿能力拆分：
 * - 全局关 → restore/backup/策略都关
 * - 全局开 + 工单修改/预填等 → 只开 backup
 * - 全局开 + 普通新建 → restore + backup 都开
 * @param {object} route
 * @param {object} [options]
 * @returns {{ restore: boolean, backup: boolean, backupOnSubmit: boolean }}
 */
export function resolveCreateFormDraftFlags (route, options = {}) {
  const empty = {
    restore: false,
    backup: false,
    backupOnSubmit: false,
  }
  if (!isCreateFormDraftEnabled()) return empty
  const backup = true
  const backupOnSubmit = backup && !!CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess
  if (isCreateFormDraftRestoreBlocked(route, options)) {
    return { restore: false, backup, backupOnSubmit }
  }
  return { restore: true, backup, backupOnSubmit }
}

/**
 * 兼容旧 API：原先「可用草稿」含读写一体，现对齐为是否开启回填
 * @param {object} route
 * @param {object} [options]
 * @returns {boolean}
 */
export function shouldUseCreateDraft (route, options = {}) {
  return resolveCreateFormDraftFlags(route, options).restore
}

/**
 * 控件草稿回填来源：session（同 tab）/ local（跨 tab）/ null（无草稿）
 * 各页面与子组件共用，勿各自再读 storage 判断。
 * @param {string} formScope
 * @param {string} fieldKey
 * @returns {'session'|'local'|null}
 */
export function resolveCreateFormDraftRestoreSource (formScope, fieldKey) {
  if (!formScope || !fieldKey) return null
  const sessionVal = getComponentDraft(formScope, fieldKey, SESSION_DRAFT_STORAGE_KEY)
  if (sessionVal !== null && sessionVal !== undefined) return 'session'
  const localVal = getComponentDraft(formScope, fieldKey, DRAFT_STORAGE_KEY)
  if (localVal !== null && localVal !== undefined) return 'local'
  return null
}

/**
 * 是否为 local（跨 tab）回填
 * @param {string} formScope
 * @param {string} fieldKey
 * @returns {boolean}
 */
export function isCreateFormDraftRestoreFromLocal (formScope, fieldKey) {
  return resolveCreateFormDraftRestoreSource(formScope, fieldKey) === 'local'
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
    : (item) => (item && typeof item === 'object' ? (item.id ?? item.key ?? item.value ?? item) : item)
  const preferredId = (preferred && typeof preferred === 'object')
    ? (preferred.id ?? preferred.key ?? preferred.value)
    : preferred
  if (preferredId == null || preferredId === '') return null
  const hit = options.find(item => {
    const id = getId(item)
    return id === preferredId || String(id) === String(preferredId)
  })
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
