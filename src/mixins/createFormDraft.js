/**
 * 创建页草稿宿主 mixin：组件自管回填；页面管零散 field。
 * 进页拆分开关（provide 给子组件，子组件勿再读全局开关）：
 * - canRestoreCreateFormDraft：是否开启草稿回填
 * - canBackupCreateFormDraft：是否开启草稿备份
 * - canBackupCreateFormDraftOnSubmit：表单校验通过后 flush 落盘
 */
import {
  clearDraft,
  getComponentDraft,
  setComponentDraft,
  clearComponentDraft,
  pickPreferredInOptions,
  getDraftValueByPath,
  mergeDraftValue,
  resolveCreateFormDraftFlags,
  DRAFT_KIND,
  DRAFT_STORAGE_KEY,
  SESSION_DRAFT_STORAGE_KEY,
  ensureCreateFormSessionTabIsolation,
  getDraftEntry,
  isCreateFormDraftRestoreFromLocal,
} from '@/utils/createFormDraft'

const EMPTY_CREATE_FORM_DRAFT_FLAGS = {
  restore: false,
  backup: false,
  backupOnSubmit: false,
}

export default {
  data () {
    return {
      createFormDraftUserInteracted: false,
    }
  },
  /**
   * Vue2 不会把 data 里 `_` 开头字段代理到实例；会话态放 created
   */
  created () {
    // 须最先执行：复制标签页继承的 session 先清掉，再固化跨 tab 来源
    ensureCreateFormSessionTabIsolation()
    this._createFormDraftInteractionBound = false
    this._createFormFieldDraftFlushers = []
    this._createFormFieldDraftSession = Object.create(null)
    this._boundCreateFormFieldDrafts = Object.create(null)
    this._createFormFieldKinds = Object.create(null)
    this._createFormFieldTouchedKeys = Object.create(null)
    // 进页瞬间按 storage 固化「仅 local」，避免子组件提前写 session 后误判成同 tab
    this._createFormFieldDraftFromLocal = Object.create(null)
  },
  provide () {
    return {
      getCreateFormDraftScope: () => this.getCreateFormDraftScope(),
      // 兼容旧 inject：对齐「回填」开关
      canUseCreateFormFieldDraft: () => this.canRestoreCreateFormDraft,
      canRestoreCreateFormFieldDraft: () => this.canRestoreCreateFormDraft,
      canBackupCreateFormFieldDraft: () => this.canBackupCreateFormDraft,
      canBackupCreateFormFieldDraftOnSubmit: () => this.canBackupCreateFormDraftOnSubmit,
      registerCreateFormFieldDraftFlush: (fn) => this.registerCreateFormFieldDraftFlush(fn),
      readCreateFormFieldDraft: (key) => this.readCreateFormFieldDraft(key),
      writeCreateFormFieldDraft: (key, data, options) => this.writeCreateFormFieldDraft(key, data, options),
      bindCreateFormFieldDraft: (spec) => this.bindCreateFormFieldDraft(spec),
      isCreateFormFieldTouched: (key) => this.isCreateFormFieldTouched(key),
      markCreateFormFieldTouched: (key) => this.markCreateFormFieldTouched(key),
      isCreateFormFieldDraftFromLocal: (key) => this.isCreateFormFieldDraftFromLocal(key),
    }
  },
  computed: {
    /** 解析当前页 restore / backup / 落盘策略 */
    createFormDraftFlags () {
      const opts = this.resolveCreateFormDraftOptions()
      if (!opts?.formScope) {
        return { ...EMPTY_CREATE_FORM_DRAFT_FLAGS }
      }
      return resolveCreateFormDraftFlags(this.$route, {
        // 默认不按预填 query 整页关回填；需整页关时由页面显式传 prefillQueryKeys
        prefillQueryKeys: opts.prefillQueryKeys,
        disableWhen: typeof opts.disableWhen === 'function'
          ? () => opts.disableWhen()
          : undefined,
      })
    },
    /** 是否开启草稿回填 */
    canRestoreCreateFormDraft () {
      return !!this.createFormDraftFlags.restore
    },
    /** 是否开启草稿备份 */
    canBackupCreateFormDraft () {
      return !!this.createFormDraftFlags.backup
    },
    /** 表单校验通过后 flush 落盘 */
    canBackupCreateFormDraftOnSubmit () {
      return !!this.createFormDraftFlags.backupOnSubmit
    },
    /**
     * 兼容旧名：对齐「回填」能力（工单/预填场景为 false，但备份仍可能开启）
     */
    canUseCreateFormDraft () {
      return this.canRestoreCreateFormDraft
    },
  },
  mounted () {
    this.$nextTick(() => {
      this.restoreBoundCreateFormFieldDrafts()
      this._bindCreateFormDraftUserInteraction()
    })
  },
  beforeDestroy () {
    this._unbindCreateFormDraftUserInteraction()
    this._createFormFieldDraftFlushers = []
    this._boundCreateFormFieldDrafts = Object.create(null)
    this._createFormFieldDraftSession = Object.create(null)
    this._createFormFieldKinds = Object.create(null)
    this._createFormFieldTouchedKeys = Object.create(null)
    this._createFormFieldDraftFromLocal = Object.create(null)
  },
  methods: {
    resolveCreateFormDraftOptions () {
      if (typeof this.createFormDraftOptions === 'function') {
        return this.createFormDraftOptions()
      }
      return this.createFormDraftOptions || null
    },
    getCreateFormDraftScope () {
      const opts = this.resolveCreateFormDraftOptions()
      return opts?.formScope || null
    },
    registerCreateFormFieldDraftFlush (fn) {
      if (typeof fn !== 'function') return
      if (!this._createFormFieldDraftFlushers) this._createFormFieldDraftFlushers = []
      this._createFormFieldDraftFlushers.push(fn)
    },
    flushCreateFormFieldDrafts () {
      if (!this.canBackupCreateFormDraftOnSubmit) return
      ;(this._createFormFieldDraftFlushers || []).forEach((fn) => {
        try { fn() } catch (e) { /* ignore */ }
      })
    },
    /**
     * 字段 kind 解析：options.kind > 绑定注册 kind > 默认 composite
     */
    resolveCreateFormFieldKind (fieldKey, options = {}) {
      if (options.kind) return options.kind
      if (this._createFormFieldKinds && Object.prototype.hasOwnProperty.call(this._createFormFieldKinds, fieldKey)) {
        return this._createFormFieldKinds[fieldKey]
      }
      return DRAFT_KIND.COMPOSITE
    },
    markCreateFormFieldTouched (fieldKey) {
      if (!fieldKey) return
      if (!this._createFormFieldTouchedKeys) this._createFormFieldTouchedKeys = Object.create(null)
      this._createFormFieldTouchedKeys[fieldKey] = true
    },
    isCreateFormFieldTouched (fieldKey) {
      return !!(this._createFormFieldTouchedKeys && this._createFormFieldTouchedKeys[fieldKey])
    },
    /** 读草稿：回填或备份任一开启即可（写合并 / 回填都需要） */
    readCreateFormFieldDraft (fieldKey) {
      if (!fieldKey || (!this.canRestoreCreateFormDraft && !this.canBackupCreateFormDraft)) return null
      const session = this._createFormFieldDraftSession
      if (session && Object.prototype.hasOwnProperty.call(session, fieldKey)) {
        return session[fieldKey]
      }
      const scope = this.getCreateFormDraftScope()
      if (!scope) return null
      const sessionVal = getComponentDraft(scope, fieldKey, SESSION_DRAFT_STORAGE_KEY)
      if (sessionVal !== null) return sessionVal
      return getComponentDraft(scope, fieldKey, DRAFT_STORAGE_KEY)
    },
    /**
     * 进页时按 storage 固化「仅 local」（session 无且 local 有）。
     * 只记第一次，避免本页 persist 写入 session 后把跨 tab 误判成同 tab。
     */
    rememberCreateFormFieldDraftLocalOrigin (fieldKey) {
      if (!fieldKey || !this.canRestoreCreateFormDraft) return false
      if (!this._createFormFieldDraftFromLocal) {
        this._createFormFieldDraftFromLocal = Object.create(null)
      }
      if (Object.prototype.hasOwnProperty.call(this._createFormFieldDraftFromLocal, fieldKey)) {
        return this._createFormFieldDraftFromLocal[fieldKey]
      }
      const scope = this.getCreateFormDraftScope()
      if (!scope) {
        this._createFormFieldDraftFromLocal[fieldKey] = false
        return false
      }
      const fromLocal = isCreateFormDraftRestoreFromLocal(scope, fieldKey)
      this._createFormFieldDraftFromLocal[fieldKey] = fromLocal
      return fromLocal
    },
    rememberAllCreateFormFieldDraftLocalOrigins () {
      if (!this.canRestoreCreateFormDraft) return
      const scope = this.getCreateFormDraftScope()
      if (!scope) return
      const keys = Object.create(null)
      ;[SESSION_DRAFT_STORAGE_KEY, DRAFT_STORAGE_KEY].forEach((storageKey) => {
        const entry = getDraftEntry(scope, storageKey)
        const components = entry && entry.components
        if (!components || typeof components !== 'object') return
        Object.keys(components).forEach((key) => { keys[key] = true })
      })
      Object.keys(keys).forEach((key) => {
        this.rememberCreateFormFieldDraftLocalOrigin(key)
      })
    },
    /**
     * 某控件草稿是否仅来自 local（跨 tab）：进页时 session 无、local 有
     * 同 tab session 草稿 → false（全量回填）；跨 tab local → true（磁盘高级/数据盘不回填）
     */
    isCreateFormFieldDraftFromLocal (fieldKey) {
      if (!fieldKey || !this.canRestoreCreateFormDraft) return false
      if (this._createFormFieldDraftFromLocal &&
        Object.prototype.hasOwnProperty.call(this._createFormFieldDraftFromLocal, fieldKey)) {
        return this._createFormFieldDraftFromLocal[fieldKey]
      }
      return this.rememberCreateFormFieldDraftLocalOrigin(fieldKey)
    },
    /**
     * 回填读取：跨 tab 强制读 local，避免被本页提前写入的 session 盖住
     */
    readCreateFormFieldDraftForRestore (fieldKey) {
      if (!fieldKey || !this.canRestoreCreateFormDraft) return null
      if (this.isCreateFormFieldDraftFromLocal(fieldKey)) {
        const scope = this.getCreateFormDraftScope()
        if (!scope) return null
        return getComponentDraft(scope, fieldKey, DRAFT_STORAGE_KEY)
      }
      return this.readCreateFormFieldDraft(fieldKey)
    },
    /** 是否允许本次落盘：仅表单校验通过后的 flush（fromSubmit） */
    shouldPersistCreateFormFieldDraft (options = {}) {
      return !!(options && options.fromSubmit) && this.canBackupCreateFormDraftOnSubmit
    },
    writeCreateFormFieldDraft (fieldKey, data, options = {}) {
      if (!fieldKey || !this.canBackupCreateFormDraft) return
      // null：显式清空该控件草稿（删光/取消后保证与表单一致）
      if (data === null) {
        this.clearCreateFormFieldDraft(fieldKey)
        return
      }
      if (data === undefined) return
      if (!this.shouldPersistCreateFormFieldDraft(options)) return
      if (!this._createFormFieldDraftSession) {
        this._createFormFieldDraftSession = Object.create(null)
      }
      let next = data
      if (options.merge) {
        next = mergeDraftValue(this.readCreateFormFieldDraft(fieldKey), data)
      }
      this._createFormFieldDraftSession[fieldKey] = next
      // 用户已交互后写入 → 该字段视为被用户改过，不再延迟回填
      if (this.createFormDraftUserInteracted) {
        this.markCreateFormFieldTouched(fieldKey)
      }
      const scope = this.getCreateFormDraftScope()
      if (!scope) return
      const kind = this.resolveCreateFormFieldKind(fieldKey, options)
      // selection：session + local 双写；input / composite：仅 session
      setComponentDraft(scope, fieldKey, next, SESSION_DRAFT_STORAGE_KEY)
      if (kind === DRAFT_KIND.SELECTION) {
        setComponentDraft(scope, fieldKey, next, DRAFT_STORAGE_KEY)
      }
    },
    readCreateFormFieldDraftPath (fieldKey, path) {
      return getDraftValueByPath(this.readCreateFormFieldDraft(fieldKey), path)
    },
    clearCreateFormFieldDraft (fieldKey) {
      if (!fieldKey) return
      if (this._createFormFieldDraftSession) {
        delete this._createFormFieldDraftSession[fieldKey]
      }
      const scope = this.getCreateFormDraftScope()
      if (!scope) return
      clearComponentDraft(scope, fieldKey, SESSION_DRAFT_STORAGE_KEY)
      clearComponentDraft(scope, fieldKey, DRAFT_STORAGE_KEY)
    },
    /**
     * 绑定页面内控件（开关 / input / 折叠等）
     */
    bindCreateFormFieldDraft (spec) {
      if (!spec?.key || typeof spec.get !== 'function') return
      if (!this._boundCreateFormFieldDrafts) this._boundCreateFormFieldDrafts = Object.create(null)
      this._boundCreateFormFieldDrafts[spec.key] = spec
      if (spec.kind) {
        if (!this._createFormFieldKinds) this._createFormFieldKinds = Object.create(null)
        this._createFormFieldKinds[spec.key] = spec.kind
      }
      this.registerCreateFormFieldDraftFlush(() => {
        const value = spec.get()
        if (value === null) {
          this.clearCreateFormFieldDraft(spec.key)
          return
        }
        if (value !== undefined) {
          this.writeCreateFormFieldDraft(spec.key, value, { fromSubmit: true, kind: spec.kind })
        }
      })
    },
    restoreCreateFormFieldDraft (fieldKey) {
      if (!this.canRestoreCreateFormDraft) return false
      if (this.isCreateFormFieldTouched(fieldKey)) return false
      const spec = this._boundCreateFormFieldDrafts?.[fieldKey]
      if (!spec || typeof spec.set !== 'function') return false
      // 输入类字段不回填（只存不读）
      if (this.resolveCreateFormFieldKind(fieldKey, {}) === DRAFT_KIND.INPUT) return false
      const draft = this.readCreateFormFieldDraft(fieldKey)
      if (draft === null || draft === undefined) return false
      if (typeof spec.match === 'function' && !spec.match(draft)) return false
      if (Array.isArray(spec.options)) {
        const hit = pickPreferredInOptions(spec.options, draft, spec.matchOpts || {})
        if (hit == null) return false
        spec.set(hit)
        if (!this._createFormFieldDraftSession) this._createFormFieldDraftSession = Object.create(null)
        this._createFormFieldDraftSession[fieldKey] = draft
        return true
      }
      spec.set(draft)
      if (!this._createFormFieldDraftSession) this._createFormFieldDraftSession = Object.create(null)
      this._createFormFieldDraftSession[fieldKey] = draft
      return true
    },
    restoreBoundCreateFormFieldDrafts () {
      if (!this.canRestoreCreateFormDraft) return
      const map = this._boundCreateFormFieldDrafts || {}
      Object.keys(map).forEach((key) => {
        try { this.restoreCreateFormFieldDraft(key) } catch (e) { /* ignore */ }
      })
    },
    bindFormFcFieldDraft (fieldKey, opts = {}) {
      const formField = opts.formField || fieldKey
      const kind = opts.kind || DRAFT_KIND.SELECTION
      if (kind === DRAFT_KIND.INPUT) return
      this.bindCreateFormFieldDraft({
        key: fieldKey,
        kind,
        get: () => this.form?.fc?.getFieldValue?.(formField),
        set: (val) => {
          if (this.form?.fc) {
            this.form.fc.setFieldsValue({ [formField]: val })
          }
        },
        options: opts.options,
        matchOpts: opts.matchOpts,
        match: opts.match,
      })
    },
    _bindCreateFormDraftUserInteraction () {
      if (this._createFormDraftInteractionBound || this.createFormDraftUserInteracted) return
      if (!this.$el || typeof this.$el.addEventListener !== 'function') return
      if (!this.canBackupCreateFormDraft && !this.canRestoreCreateFormDraft) return
      this._createFormDraftInteractionBound = true
      this._onCreateFormDraftUserInteract = (e) => {
        if (!this.$el.contains(e.target)) return
        this.markCreateFormDraftUserInteracted()
      }
      this.$el.addEventListener('pointerdown', this._onCreateFormDraftUserInteract, true)
      this.$el.addEventListener('keydown', this._onCreateFormDraftUserInteract, true)
    },
    _unbindCreateFormDraftUserInteraction () {
      if (!this._createFormDraftInteractionBound || !this.$el) return
      this.$el.removeEventListener('pointerdown', this._onCreateFormDraftUserInteract, true)
      this.$el.removeEventListener('keydown', this._onCreateFormDraftUserInteract, true)
      this._createFormDraftInteractionBound = false
      this._onCreateFormDraftUserInteract = null
    },
    markCreateFormDraftUserInteracted () {
      if (this.createFormDraftUserInteracted) return
      this.createFormDraftUserInteracted = true
      this._unbindCreateFormDraftUserInteraction()
    },
    clearCreateFormDraft () {
      const opts = this.resolveCreateFormDraftOptions()
      if (!opts?.formScope) return
      clearDraft(opts.formScope, SESSION_DRAFT_STORAGE_KEY)
      clearDraft(opts.formScope, DRAFT_STORAGE_KEY)
      this._createFormFieldDraftSession = Object.create(null)
    },
  },
}
