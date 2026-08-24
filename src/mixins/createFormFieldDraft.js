/**
 * 控件级创建草稿 mixin（独立子组件）
 *
 * 仅以下「创建页」应传 form-draft-key 并 provide 草稿 scope（虚拟机 / 容器主机 / 裸金属 / 硬盘 / EIP / RDS / Redis）。
 * 弹框、调整配置等复用同一组件时：不传 formDraftKey → 不读写、不回填，表现与接入草稿前一致。
 *
 * - formDraftKey：页内稳定 fieldKey；空则草稿全关
 * - formDraftFields：可选，自动从 form.fc 序列化/回填这些字段名
 * - 子类可实现 getCreateFormFieldDraftSnapshot / applyCreateFormFieldDraft 覆盖
 */
import {
  getComponentDraft,
  setComponentDraft,
  clearComponentDraft,
  pickPreferredInOptions,
  getDraftValueByPath,
  setDraftValueByPath,
  mergeDraftValue,
  pickFields,
  CREATE_FORM_DRAFT_SWITCHES,
} from '@/utils/createFormDraft'

export default {
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    disableFormDraft: {
      type: Boolean,
      default: false,
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
    registerCreateFormFieldDraftFlush: { default: undefined },
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
    this.$nextTick(() => {
      // 工单回填 / 表单修改期间 canUse 为 false，不回填
      this.restoreFormFieldDraftFields()
    })
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
    isFormDraftKeyWired () {
      return !!(this.formDraftKey && !this.disableFormDraft)
    },
    canReadWriteFormFieldDraft () {
      if (!this.isFormDraftKeyWired()) return false
      if (typeof this.canUseCreateFormFieldDraft === 'function') {
        return !!this.canUseCreateFormFieldDraft()
      }
      // 无父级 provide：即使误传了 key 也不启用
      return false
    },
    /** 仅回填：与读写同一开关（工单/修改期间禁用） */
    canRestoreFormFieldDraft () {
      return this.canReadWriteFormFieldDraft()
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
    readFormFieldDraft () {
      if (!this.canReadWriteFormFieldDraft()) return null
      if (this._formFieldDraftSession !== undefined) {
        return this._formFieldDraftSession
      }
      const scope = this.resolveFormDraftScope()
      if (!scope) return null
      return getComponentDraft(scope, this.formDraftKey)
    },
    writeFormFieldDraft (data, options = {}) {
      if (!this.canReadWriteFormFieldDraft()) return
      // null：显式清空（删光/取消后保证展示与提交一致）
      if (data === null) {
        this.clearFormFieldDraft()
        return
      }
      if (data === undefined) return
      let next = data
      if (options.merge) {
        next = mergeDraftValue(this.readFormFieldDraft(), data)
      }
      this._formFieldDraftSession = next
      const fromSubmit = !!(options && options.fromSubmit)
      const force = !!(options && options.force) || fromSubmit
      if (force) {
        if (!CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess && !CREATE_FORM_DRAFT_SWITCHES.saveOnChange) return
        if (fromSubmit && !CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess) return
      } else if (!CREATE_FORM_DRAFT_SWITCHES.saveOnChange) {
        return
      }
      const scope = this.resolveFormDraftScope()
      if (!scope) return
      setComponentDraft(scope, this.formDraftKey, next)
    },
    readFormFieldDraftPath (path) {
      return getDraftValueByPath(this.readFormFieldDraft(), path)
    },
    writeFormFieldDraftPath (path, value, options = {}) {
      if (!this.canReadWriteFormFieldDraft()) return
      const next = setDraftValueByPath(this.readFormFieldDraft() || {}, path, value)
      this.writeFormFieldDraft(next, options)
    },
    clearFormFieldDraft () {
      if (!this.formDraftKey) return
      this._formFieldDraftSession = undefined
      const scope = this.resolveFormDraftScope()
      if (!scope) return
      clearComponentDraft(scope, this.formDraftKey)
    },
    matchFormFieldDraftInOptions (options, preferred, opts = {}) {
      const draft = preferred !== undefined ? preferred : this.readFormFieldDraft()
      return pickPreferredInOptions(options, draft, opts)
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
      const draft = this.readFormFieldDraft()
      if (draft === null || draft === undefined) return false
      if (typeof this.applyCreateFormFieldDraft === 'function') {
        this.applyCreateFormFieldDraft(draft)
        return true
      }
      const fc = this.resolveFormFc()
      if (this.formDraftFields?.length && fc && draft && typeof draft === 'object') {
        const values = pickFields(draft, this.formDraftFields)
        if (Object.keys(values).length) {
          this.applyFormFieldValues(values)
          return true
        }
      }
      return false
    },
    /** 用户改值后：写当前 snapshot；null 表示清空草稿 */
    persistFormFieldDraftSnapshot (options = {}) {
      const data = this.serializeFormFieldDraft()
      if (data === null) {
        this.clearFormFieldDraft()
        return
      }
      if (data !== undefined) this.writeFormFieldDraft(data, options)
    },
    flushFormFieldDraftOnSubmit () {
      const data = this.serializeFormFieldDraft()
      if (data === null) {
        this.clearFormFieldDraft()
        return
      }
      if (data !== undefined) {
        this.writeFormFieldDraft(data, { fromSubmit: true })
      }
    },
    _registerFormFieldDraftFlush () {
      if (this._formFieldDraftFlushRegistered) return
      if (typeof this.registerCreateFormFieldDraftFlush !== 'function') return
      if (!this.formDraftKey) return
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
