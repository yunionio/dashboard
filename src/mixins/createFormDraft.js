/**
 * 创建页草稿宿主 mixin（仅控件级）
 *
 * - 子组件：createFormFieldDraft mixin（formDraftKey）
 * - 页面内开关/input/折叠：bindCreateFormFieldDraft / writeCreateFormFieldDraft
 * - 提交成功：flushCreateFormFieldDrafts()
 *
 * createFormDraftOptions：
 * {
 *   formScope: string,
 *   prefillQueryKeys?: string[],
 *   disableWhen?: () => boolean,
 * }
 *
 * ## 页面内控件示例
 * this.bindCreateFormFieldDraft({
 *   key: 'advanceConfigOpen',
 *   get: () => this.collapseActive.includes('1'),
 *   set: (open) => { this.collapseActive = open ? ['1'] : [] },
 * })
 */
import {
  clearDraft,
  clearAllDrafts,
  getComponentDraft,
  setComponentDraft,
  clearComponentDraft,
  pickPreferredInOptions,
  getDraftValueByPath,
  setDraftValueByPath,
  mergeDraftValue,
  shouldUseCreateDraft,
  DEFAULT_PREFILL_QUERY_KEYS,
  CREATE_FORM_DRAFT_SWITCHES,
} from '@/utils/createFormDraft'

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
    this._createFormDraftInteractionBound = false
    this._createFormFieldDraftFlushers = []
    this._createFormFieldDraftSession = Object.create(null)
    this._boundCreateFormFieldDrafts = Object.create(null)
  },
  provide () {
    return {
      getCreateFormDraftScope: () => this.getCreateFormDraftScope(),
      canUseCreateFormFieldDraft: () => this.canUseCreateFormDraft,
      registerCreateFormFieldDraftFlush: (fn) => this.registerCreateFormFieldDraftFlush(fn),
      readCreateFormFieldDraft: (key) => this.readCreateFormFieldDraft(key),
      writeCreateFormFieldDraft: (key, data, options) => this.writeCreateFormFieldDraft(key, data, options),
      bindCreateFormFieldDraft: (spec) => this.bindCreateFormFieldDraft(spec),
    }
  },
  computed: {
    canUseCreateFormDraft () {
      const opts = this.resolveCreateFormDraftOptions()
      if (!opts?.formScope) return false
      return shouldUseCreateDraft(this.$route, {
        prefillQueryKeys: opts.prefillQueryKeys || DEFAULT_PREFILL_QUERY_KEYS,
        disableWhen: typeof opts.disableWhen === 'function'
          ? () => opts.disableWhen()
          : undefined,
      })
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
      if (!this.canUseCreateFormDraft) return
      if (!CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess) return
      ;(this._createFormFieldDraftFlushers || []).forEach((fn) => {
        try { fn() } catch (e) { /* ignore */ }
      })
    },
    /** @deprecated 请改用 flushCreateFormFieldDrafts */
    saveCreateFormDraft (payload, options = {}) {
      if (options && options.fromSubmit) {
        this.flushCreateFormFieldDrafts()
      }
    },
    readCreateFormFieldDraft (fieldKey) {
      if (!fieldKey || !this.canUseCreateFormDraft) return null
      const session = this._createFormFieldDraftSession
      if (session && Object.prototype.hasOwnProperty.call(session, fieldKey)) {
        return session[fieldKey]
      }
      const scope = this.getCreateFormDraftScope()
      if (!scope) return null
      return getComponentDraft(scope, fieldKey)
    },
    writeCreateFormFieldDraft (fieldKey, data, options = {}) {
      if (!fieldKey || !this.canUseCreateFormDraft) return
      // null：显式清空该控件草稿（删光/取消后保证与表单一致）
      if (data === null) {
        this.clearCreateFormFieldDraft(fieldKey)
        return
      }
      if (data === undefined) return
      if (!this._createFormFieldDraftSession) {
        this._createFormFieldDraftSession = Object.create(null)
      }
      let next = data
      if (options.merge) {
        next = mergeDraftValue(this.readCreateFormFieldDraft(fieldKey), data)
      }
      this._createFormFieldDraftSession[fieldKey] = next
      const fromSubmit = !!(options && options.fromSubmit)
      const force = !!(options && options.force) || fromSubmit
      if (force) {
        if (!CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess && !CREATE_FORM_DRAFT_SWITCHES.saveOnChange) return
        if (fromSubmit && !CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess) return
      } else if (!CREATE_FORM_DRAFT_SWITCHES.saveOnChange) {
        return
      }
      const scope = this.getCreateFormDraftScope()
      if (!scope) return
      setComponentDraft(scope, fieldKey, next)
    },
    readCreateFormFieldDraftPath (fieldKey, path) {
      return getDraftValueByPath(this.readCreateFormFieldDraft(fieldKey), path)
    },
    writeCreateFormFieldDraftPath (fieldKey, path, value, options = {}) {
      if (!fieldKey || !this.canUseCreateFormDraft) return
      const next = setDraftValueByPath(this.readCreateFormFieldDraft(fieldKey) || {}, path, value)
      this.writeCreateFormFieldDraft(fieldKey, next, options)
    },
    clearCreateFormFieldDraft (fieldKey) {
      if (!fieldKey) return
      if (this._createFormFieldDraftSession) {
        delete this._createFormFieldDraftSession[fieldKey]
      }
      const scope = this.getCreateFormDraftScope()
      if (!scope) return
      clearComponentDraft(scope, fieldKey)
    },
    /**
     * 绑定页面内控件（开关 / input / 折叠等）
     * @param {object} spec
     * @param {string} spec.key
     * @param {() => *} spec.get
     * @param {(val:*) => void} [spec.set]
     * @param {boolean} [spec.restore=true]
     * @param {Array} [spec.options]
     * @param {object} [spec.matchOpts]
     * @param {(draft:*) => boolean} [spec.match]
     */
    bindCreateFormFieldDraft (spec) {
      if (!spec?.key || typeof spec.get !== 'function') return
      if (!this._boundCreateFormFieldDrafts) this._boundCreateFormFieldDrafts = Object.create(null)
      this._boundCreateFormFieldDrafts[spec.key] = spec
      this.registerCreateFormFieldDraftFlush(() => {
        const value = spec.get()
        if (value === null) {
          this.clearCreateFormFieldDraft(spec.key)
          return
        }
        if (value !== undefined) {
          this.writeCreateFormFieldDraft(spec.key, value, { fromSubmit: true })
        }
      })
    },
    restoreCreateFormFieldDraft (fieldKey) {
      if (!this.canUseCreateFormDraft) return false
      const spec = this._boundCreateFormFieldDrafts?.[fieldKey]
      if (!spec || typeof spec.set !== 'function') return false
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
      if (!this.canUseCreateFormDraft) return
      const map = this._boundCreateFormFieldDrafts || {}
      Object.keys(map).forEach((key) => {
        if (map[key].restore === false) return
        try { this.restoreCreateFormFieldDraft(key) } catch (e) { /* ignore */ }
      })
    },
    bindFormFcFieldDraft (fieldKey, opts = {}) {
      const formField = opts.formField || fieldKey
      this.bindCreateFormFieldDraft({
        key: fieldKey,
        restore: opts.restore !== false,
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
    isCreateFormDraftSaveOnChangeEnabled () {
      return !!CREATE_FORM_DRAFT_SWITCHES.saveOnChange
    },
    isCreateFormDraftSaveOnSubmitSuccessEnabled () {
      return !!CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess
    },
    _bindCreateFormDraftUserInteraction () {
      if (this._createFormDraftInteractionBound || this.createFormDraftUserInteracted) return
      if (!this.$el || typeof this.$el.addEventListener !== 'function') return
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
      clearDraft(opts.formScope)
      this._createFormFieldDraftSession = Object.create(null)
    },
    clearAllCreateFormDrafts () {
      clearAllDrafts()
      this._createFormFieldDraftSession = Object.create(null)
    },
  },
}
