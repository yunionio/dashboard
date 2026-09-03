/**
 * 控件级创建草稿 mixin：页面传 formDraftKey 启用，组件自管回填。
 * 回填 / 备份 / 落盘策略均由页面 provide；仅在表单校验通过后 flush 落盘。
 */
import {
  getComponentDraft,
  setComponentDraft,
  clearComponentDraft,
  pickPreferredInOptions,
  getDraftValueByPath,
  mergeDraftValue,
  pickFields,
  DRAFT_KIND,
  DRAFT_STORAGE_KEY,
  SESSION_DRAFT_STORAGE_KEY,
  isCreateFormDraftRestoreFromLocal,
} from '@/utils/createFormDraft'

export default {
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    enableFormDraft: {
      type: Boolean,
      default: undefined,
    },
    disableFormDraft: {
      type: Boolean,
      default: false,
    },
    /** 字段类型：selection（双写 local+session）/ input（仅 session、不回填）/ composite（仅 session，默认） */
    formDraftKind: {
      type: String,
      default: DRAFT_KIND.COMPOSITE,
    },
    /** 回填白名单：复合控件只回填这些选择型子字段，输入子字段（大小/正文/端口等）不回填 */
    formDraftRestoreFields: {
      type: Array,
      default: () => [],
    },
    /** 自动读写的 form.fc 字段名列表（无自定义 snapshot 时生效） */
    formDraftFields: {
      type: Array,
      default: () => [],
    },
  },
  inject: {
    getCreateFormDraftScope: { default: undefined },
    canUseCreateFormFieldDraft: { default: undefined },
    canRestoreCreateFormFieldDraft: { default: undefined },
    canBackupCreateFormFieldDraft: { default: undefined },
    canBackupCreateFormFieldDraftOnSubmit: { default: undefined },
    registerCreateFormFieldDraftFlush: { default: undefined },
    isCreateFormFieldTouched: { default: undefined },
    markCreateFormFieldTouched: { default: undefined },
    isCreateFormFieldDraftFromLocal: { default: undefined },
    // 勿 inject 名为 form：会盖住 props.form（dialog 未 provide 时变成 undefined）
    providedForm: { from: 'form', default: undefined },
  },
  data () {
    return {
      _formFieldDraftFlushRegistered: false,
      _formFieldDraftSession: undefined,
    }
  },
  mounted () {
    this._registerFormFieldDraftFlush()
    // 回填由各组件自管（watch opts / resList 等），mixin 不再 mounted 统一踢
  },
  beforeDestroy () {
    this._unregisterFormFieldDraftFlush()
  },
  methods: {
    /** props.form 优先，其次 provide */
    resolveFormRef () {
      return this.$props.form || this.providedForm || this.form || null
    },
    /** 创建页是否挂了草稿 key（未挂则组件应按草稿前逻辑跑，禁止副作用） */
    resolveFormDraftKey () {
      return this.formDraftKey || this.formDraftDefaultKey || this.$options.formDraftDefaultKey || ''
    },
    /** 当前控件是否已被用户改过（页面级 touched） */
    isFormFieldDraftTouched () {
      const key = this.resolveFormDraftKey()
      if (!key || typeof this.isCreateFormFieldTouched !== 'function') return false
      return !!this.isCreateFormFieldTouched(key)
    },
    /** 用户手改：标记后 opts watch 不再回填该控件草稿 */
    markFormFieldDraftTouched () {
      const key = this.resolveFormDraftKey()
      if (!key || typeof this.markCreateFormFieldTouched !== 'function') return
      this.markCreateFormFieldTouched(key)
    },
    isFormDraftKeyWired () {
      if (this.disableFormDraft || this.enableFormDraft === false) return false
      const key = this.resolveFormDraftKey()
      if (!key) return false
      if (this.enableFormDraft === true) return true
      return !!this.formDraftKey
    },
    /** 页面是否开启草稿备份（子组件勿再读全局开关） */
    canBackupFormFieldDraft () {
      if (!this.isFormDraftKeyWired()) return false
      if (typeof this.canBackupCreateFormFieldDraft === 'function') {
        return !!this.canBackupCreateFormFieldDraft()
      }
      // 兼容旧宿主：仅提供 canUse（旧语义=读写一体）
      if (typeof this.canUseCreateFormFieldDraft === 'function') {
        return !!this.canUseCreateFormFieldDraft()
      }
      return false
    },
    /** 页面是否开启草稿回填 */
    canRestoreFormFieldDraft () {
      if (!this.isFormDraftKeyWired()) return false
      if (typeof this.canRestoreCreateFormFieldDraft === 'function') {
        return !!this.canRestoreCreateFormFieldDraft()
      }
      if (typeof this.canUseCreateFormFieldDraft === 'function') {
        return !!this.canUseCreateFormFieldDraft()
      }
      return false
    },
    /** 表单校验通过后 flush 落盘（页面 provide；无则回退 canBackup） */
    canBackupFormFieldDraftOnSubmit () {
      if (!this.canBackupFormFieldDraft()) return false
      if (typeof this.canBackupCreateFormFieldDraftOnSubmit === 'function') {
        return !!this.canBackupCreateFormFieldDraftOnSubmit()
      }
      return this.canBackupFormFieldDraft()
    },
    /**
     * 兼容旧名：对齐「备份」能力（写草稿 / 读当前草稿做合并）
     * 回填判断请用 canRestoreFormFieldDraft
     */
    canReadWriteFormFieldDraft () {
      return this.canBackupFormFieldDraft()
    },
    /** 是否允许本次落盘：仅 fromSubmit */
    shouldPersistFormFieldDraft (options = {}) {
      return !!(options && options.fromSubmit) && this.canBackupFormFieldDraftOnSubmit()
    },
    /**
     * 草稿是否仅存于 local（新 tab 场景）
     * session 草稿（同 tab）恢复时完全恢复；local 草稿（新 tab）不展开高级、仅回填选择类
     */
    isFormFieldDraftFromLocal () {
      const key = this.resolveFormDraftKey()
      if (typeof this.isCreateFormFieldDraftFromLocal === 'function' && key) {
        return !!this.isCreateFormFieldDraftFromLocal(key)
      }
      const scope = this.resolveFormDraftScope()
      if (!scope || !key) return false
      return isCreateFormDraftRestoreFromLocal(scope, key)
    },
    resolveFormDraftScope () {
      if (typeof this.getCreateFormDraftScope === 'function') {
        return this.getCreateFormDraftScope() || null
      }
      return null
    },
    resolveFormFc () {
      return this.resolveFormRef()?.fc || this.fc || null
    },
    /** 读：回填或备份任一开启即可 */
    readFormFieldDraft () {
      if (!this.canRestoreFormFieldDraft() && !this.canBackupFormFieldDraft()) return null
      if (this._formFieldDraftSession !== undefined) {
        return this._formFieldDraftSession
      }
      const scope = this.resolveFormDraftScope()
      if (!scope) return null
      const sessionVal = getComponentDraft(scope, this.resolveFormDraftKey(), SESSION_DRAFT_STORAGE_KEY)
      if (sessionVal !== null) return sessionVal
      return getComponentDraft(scope, this.resolveFormDraftKey(), DRAFT_STORAGE_KEY)
    },
    writeFormFieldDraft (data, options = {}) {
      if (!this.canBackupFormFieldDraft()) return
      if (data === null) {
        if (!this.shouldPersistFormFieldDraft(options)) return
        this.clearFormFieldDraft()
        return
      }
      if (data === undefined) return
      if (!this.shouldPersistFormFieldDraft(options)) return
      let next = data
      if (options.merge) {
        next = mergeDraftValue(this.readFormFieldDraft(), data)
      }
      this._formFieldDraftSession = next
      const scope = this.resolveFormDraftScope()
      if (!scope) return
      const kind = options.kind || this.formDraftKind || DRAFT_KIND.COMPOSITE
      setComponentDraft(scope, this.resolveFormDraftKey(), next, SESSION_DRAFT_STORAGE_KEY)
      if (kind === DRAFT_KIND.SELECTION) {
        setComponentDraft(scope, this.resolveFormDraftKey(), next, DRAFT_STORAGE_KEY)
      }
    },
    readFormFieldDraftPath (path) {
      return getDraftValueByPath(this.readFormFieldDraft(), path)
    },
    clearFormFieldDraft () {
      if (!this.resolveFormDraftKey()) return
      this._formFieldDraftSession = undefined
      const scope = this.resolveFormDraftScope()
      if (!scope) return
      clearComponentDraft(scope, this.resolveFormDraftKey(), SESSION_DRAFT_STORAGE_KEY)
      clearComponentDraft(scope, this.resolveFormDraftKey(), DRAFT_STORAGE_KEY)
    },
    matchFormFieldDraftInOptions (options, preferred, opts = {}) {
      const draft = preferred !== undefined ? preferred : this.readFormFieldDraft()
      return pickPreferredInOptions(options, draft, opts)
    },
    /**
     * 回填前按白名单过滤：复合控件只保留选择型子字段，输入子字段不回填
     */
    sanitizeDraftForRestore (draft) {
      if (draft == null || typeof draft !== 'object') return draft
      if (Array.isArray(this.formDraftRestoreFields) && this.formDraftRestoreFields.length) {
        return pickFields(draft, this.formDraftRestoreFields)
      }
      return draft
    },
    /**
     * 默认序列化：优先子类 snapshot，否则 formDraftFields
     */
    serializeFormFieldDraft () {
      if (typeof this.getCreateFormFieldDraftSnapshot === 'function') {
        return this.getCreateFormFieldDraftSnapshot()
      }
      const fc = this.resolveFormFc()
      if (this.formDraftFields?.length && fc) {
        return pickFields(fc.getFieldsValue(), this.formDraftFields)
      }
      return undefined
    },
    /** setFieldsValue 后同步 form.fd（onValuesChange 不会走 fd 赋值） */
    syncFormFieldValuesToFd (values) {
      const formRef = this.resolveFormRef()
      if (!formRef?.fd || !values || typeof values !== 'object') return
      Object.keys(values).forEach((key) => {
        this.$set(formRef.fd, key, values[key])
      })
      const fc = this.resolveFormFc()
      if (!fc) return
      const formValue = fc.getFieldsValue()
      if (formValue.dataDiskSizes) {
        this.$set(formRef.fd, 'dataDiskSizes', formValue.dataDiskSizes)
      }
      if (formValue.dataDiskTypes) {
        this.$set(formRef.fd, 'dataDiskTypes', formValue.dataDiskTypes)
      }
    },
    /** 写 fc 并同步 fd */
    applyFormFieldValues (values) {
      const fc = this.resolveFormFc()
      if (!fc || !values || typeof values !== 'object') return
      fc.setFieldsValue(values)
      this.syncFormFieldValuesToFd(values)
    },
    /**
     * 默认回填：优先子类 apply，否则 formDraftFields → setFieldsValue
     */
    restoreFormFieldDraftFields () {
      if (!this.canRestoreFormFieldDraft()) return false
      // 输入类字段不回填（只存不读）
      if (this.formDraftKind === DRAFT_KIND.INPUT) return false
      // 用户已改过该字段 → 不再回填
      if (typeof this.isCreateFormFieldTouched === 'function' && this.isCreateFormFieldTouched(this.resolveFormDraftKey())) return false
      const draft = this.readFormFieldDraft()
      if (draft === null || draft === undefined) return false
      const safeDraft = this.sanitizeDraftForRestore(draft)
      if (typeof this.applyCreateFormFieldDraft === 'function') {
        this.applyCreateFormFieldDraft(safeDraft)
        return true
      }
      const fc = this.resolveFormFc()
      if (this.formDraftFields?.length && fc && safeDraft && typeof safeDraft === 'object') {
        const values = pickFields(safeDraft, this.formDraftFields)
        if (Object.keys(values).length) {
          this.applyFormFieldValues(values)
          return true
        }
      }
      return false
    },
    flushFormFieldDraftOnSubmit () {
      const data = this.serializeFormFieldDraft()
      if (data === null) {
        this.clearFormFieldDraft()
        return
      }
      if (data !== undefined) {
        this.writeFormFieldDraft(data, { fromSubmit: true, kind: this.formDraftKind })
      }
    },
    _registerFormFieldDraftFlush () {
      if (this._formFieldDraftFlushRegistered) return
      if (typeof this.registerCreateFormFieldDraftFlush !== 'function') return
      if (!this.resolveFormDraftKey() || !this.isFormDraftKeyWired()) return
      this._formFieldDraftFlush = () => this.flushFormFieldDraftOnSubmit()
      this.registerCreateFormFieldDraftFlush(this._formFieldDraftFlush)
      this._formFieldDraftFlushRegistered = true
    },
    _unregisterFormFieldDraftFlush () {
      this._formFieldDraftFlush = null
      this._formFieldDraftFlushRegistered = false
    },
  },
}
