/**
 * 创建表单配置记忆 mixin
 *
 * 业务页提供 createFormDraftOptions（computed 或 methods / 普通对象均可）：
 * {
 *   formScope: string,                 // 必填，隔离不同创建页
 *   omitKeys?: string[],               // 追加不落盘字段
 *   prefillQueryKeys?: string[],       // 追加禁用 draft 的 query
 *   disableWhen?: () => boolean,       // 业务禁用条件
 *   serialize?: () => object,          // 模式 A：从表单生成可存 payload
 *   applyDraft?: async (data) => void, // 模式 A：用草稿回填（可调 initForm）
 *   draftFields?: string[],            // 模式 B：白名单字段平铺存取
 *   isMeaningfulDraft?: (data) => boolean,
 * }
 *
 * 落盘开关仅全局一份：CREATE_FORM_DRAFT_SWITCHES（saveOnChange / saveOnSubmitSuccess）
 * 二者皆 false 时不写入、不恢复（shouldUseCreateDraft / isCreateFormDraftEnabled）
 *
 * Flag 说明（勿与工单混淆）：
 * - isInitForm（业务自有）：工单/购物车修改回填，影响提交与文案
 * - isDraftRestore：applyDraft / 平铺回填执行期间
 * - createFormDraftUserInteracted：用户在本页表单内产生过真实交互
 *
 * 写入保护（不用固定秒数）：
 * - 进页级联请求耗时不确定，禁止用「等 N 秒」判断初始化结束
 * - 防抖落盘仅在「用户已在表单内交互」后允许，避免初始化 onValuesChange 用空表覆盖草稿
 * - 提交成功 saveCreateFormDraft(..., { fromSubmit: true }) 受 saveOnSubmitSuccess 控制
 */
import {
  getDraft,
  setDraft,
  clearDraft,
  clearAllDrafts,
  shouldUseCreateDraft,
  omitIdentityFields,
  pickFields,
  DEFAULT_OMIT_KEYS,
  DEFAULT_PREFILL_QUERY_KEYS,
  CREATE_FORM_DRAFT_SWITCHES,
} from '@/utils/createFormDraft'

/** 表单变更后延迟写入草稿的间隔（仅用户交互后的防抖） */
const DEBOUNCE_MS = 1000

export default {
  data () {
    return {
      /** applyDraft 同步/await 执行中 */
      isDraftRestore: false,
      /** 本次进入是否已成功走完恢复逻辑（可给提示条用） */
      draftRestored: false,
      /** 草稿原始 data，供业务当 initFormData 使用 */
      _draftInitFormData: null,
      /** debounce 写草稿的 timer */
      _createFormDraftSaveTimer: null,
      /**
       * 用户是否已在当前页表单内真实操作过。
       * 未交互前：禁止防抖落盘；并建议业务把「回填态」延长到交互前（见 isCreateFormDraftHydrating）
       */
      createFormDraftUserInteracted: false,
      _createFormDraftInteractionBound: false,
    }
  },
  computed: {
    /** 当前路由 + 业务 disableWhen 是否允许读写草稿 */
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
    /**
     * 草稿仍在「灌入 / 级联未稳定」阶段：恢复中，或已恢复但用户尚未操作
     * 业务可用它替代固定延时：跳过清空数据盘等破坏性逻辑
     */
    isCreateFormDraftHydrating () {
      if (this.isDraftRestore) return true
      return !!(this.draftRestored && !this.createFormDraftUserInteracted)
    },
  },
  mounted () {
    this.$nextTick(() => {
      this.tryRestoreCreateFormDraft()
        .catch(() => false)
        .finally(() => {
          // applyDraft 结束后结束「同步恢复」标记；级联请求可能仍在飞，靠用户交互再开防抖写入
          this.isDraftRestore = false
          this._bindCreateFormDraftUserInteraction()
        })
    })
  },
  beforeDestroy () {
    this._unbindCreateFormDraftUserInteraction()
    if (this._createFormDraftSaveTimer) {
      clearTimeout(this._createFormDraftSaveTimer)
      this._createFormDraftSaveTimer = null
    }
  },
  methods: {
    /**
     * 读取业务配置：支持 computed 对象、methods 函数、或 data 里的普通对象
     * @returns {object|null}
     */
    resolveCreateFormDraftOptions () {
      if (typeof this.createFormDraftOptions === 'function') {
        return this.createFormDraftOptions()
      }
      return this.createFormDraftOptions || null
    },
    /**
     * 用户修改过程中是否落盘（仅读全局 CREATE_FORM_DRAFT_SWITCHES.saveOnChange）
     * @returns {boolean}
     */
    isCreateFormDraftSaveOnChangeEnabled () {
      return !!CREATE_FORM_DRAFT_SWITCHES.saveOnChange
    },
    /**
     * 提交成功后是否落盘（仅读全局 CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess）
     * @returns {boolean}
     */
    isCreateFormDraftSaveOnSubmitSuccessEnabled () {
      return !!CREATE_FORM_DRAFT_SWITCHES.saveOnSubmitSuccess
    },
    /** 默认 omit + 业务 omitKeys 去重合并 */
    getCreateFormDraftOmitKeys () {
      const opts = this.resolveCreateFormDraftOptions() || {}
      const extra = opts.omitKeys || []
      return [...new Set([...DEFAULT_OMIT_KEYS, ...extra])]
    },
    /**
     * 在组件根节点上监听用户手势；首次交互后才允许防抖写草稿
     * 不依赖请求耗时，级联多久都行
     */
    _bindCreateFormDraftUserInteraction () {
      if (this._createFormDraftInteractionBound || this.createFormDraftUserInteracted) return
      if (!this.$el || typeof this.$el.addEventListener !== 'function') return
      this._createFormDraftInteractionBound = true
      this._onCreateFormDraftUserInteract = (e) => {
        // 只认发生在本表单树内的交互，避免点到侧栏/顶栏误开写入
        if (!this.$el.contains(e.target)) return
        this.markCreateFormDraftUserInteracted()
      }
      // pointerdown / keydown：覆盖鼠标、触摸、键盘；capture 以便尽早收到
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
    /** 标记用户已操作：打开防抖落盘，并结束 hydrating */
    markCreateFormDraftUserInteracted () {
      if (this.createFormDraftUserInteracted) return
      this.createFormDraftUserInteracted = true
      this._unbindCreateFormDraftUserInteraction()
    },
    /**
     * 尝试从 localStorage 恢复草稿
     * 优先模式 A（applyDraft）；否则模式 B（draftFields + setFieldsValue）
     * @returns {Promise<boolean>} 是否成功触发回填
     */
    async tryRestoreCreateFormDraft () {
      if (!this.canUseCreateFormDraft) return false
      const opts = this.resolveCreateFormDraftOptions()
      if (!opts?.formScope) return false
      const draftData = getDraft(opts.formScope)
      if (!draftData) return false
      // 空壳草稿不恢复（与种子 meaningful 对齐）
      if (!this.isMeaningfulCreateFormDraft(draftData)) return false

      this.isDraftRestore = true
      this._draftInitFormData = draftData
      try {
        if (typeof opts.applyDraft === 'function') {
          await opts.applyDraft(draftData)
        } else if (opts.draftFields?.length && this.form?.fc) {
          const values = pickFields(draftData, opts.draftFields)
          if (Object.keys(values).length) {
            this.form.fc.setFieldsValue(values)
          }
        } else {
          return false
        }
        this.draftRestored = true
        return true
      } catch (e) {
        return false
      }
    },
    /**
     * 持久化当前配置
     * @param {object} [payload] 已拼好的提交态数据；不传则调 serialize / draftFields
     * @param {object} [options]
     * @param {boolean} [options.force] 强制写入（跳过交互门闩；提交成功场景）
     * @param {boolean} [options.fromSubmit] 标记为「提交成功落盘」，受 saveOnSubmitSuccess 控制
     */
    saveCreateFormDraft (payload, options = {}) {
      const fromSubmit = !!(options && options.fromSubmit)
      const force = !!(options && options.force) || fromSubmit || (payload != null)
      if (!this.canUseCreateFormDraft) return
      // 提交成功路径 / 修改中路径分别受开关控制
      if (force) {
        if (!this.isCreateFormDraftSaveOnSubmitSuccessEnabled()) return
      } else {
        if (!this.isCreateFormDraftSaveOnChangeEnabled()) return
        if (this.isDraftRestore || !this.createFormDraftUserInteracted) return
      }
      const opts = this.resolveCreateFormDraftOptions()
      if (!opts?.formScope) return

      let data = payload
      if (data == null) {
        if (typeof opts.serialize === 'function') {
          data = opts.serialize()
        } else if (opts.draftFields?.length && this.form?.fc) {
          data = pickFields(this.form.fc.getFieldsValue(), opts.draftFields)
        }
      }
      if (data == null || typeof data !== 'object') return
      const omitted = omitIdentityFields(data, this.getCreateFormDraftOmitKeys())
      // 防抖路径：拒绝用空草稿覆盖已有完整草稿
      if (!force && !this.isMeaningfulCreateFormDraft(omitted)) {
        const existing = getDraft(opts.formScope)
        if (existing && this.isMeaningfulCreateFormDraft(existing)) return
      }
      setDraft(opts.formScope, omitted)
    },
    /**
     * 粗判草稿是否值得落盘
     * 业务可在 options 里覆盖：createFormDraftOptions.isMeaningfulDraft
     */
    isMeaningfulCreateFormDraft (data) {
      const opts = this.resolveCreateFormDraftOptions()
      if (typeof opts?.isMeaningfulDraft === 'function') {
        return opts.isMeaningfulDraft(data)
      }
      if (!data || typeof data !== 'object') return false
      return !!(
        data.prefer_region ||
        data.prefer_zone ||
        (Array.isArray(data.prefer_zones) && data.prefer_zones.length) ||
        data.sku ||
        data.guest_template_id ||
        (data.disks && data.disks.length) ||
        (data.nets && data.nets.length) ||
        (data.extraData && (data.extraData.os || data.extraData.image_type ||
          (Array.isArray(data.extraData.providers) && data.extraData.providers.length) ||
          (Array.isArray(data.extraData.prefer_regions) && data.extraData.prefer_regions.length)))
      )
    },
    /** 清除本页（当前 formScope）草稿，并复位恢复相关状态 */
    clearCreateFormDraft () {
      const opts = this.resolveCreateFormDraftOptions()
      if (!opts?.formScope) return
      clearDraft(opts.formScope)
      this.draftRestored = false
      this._draftInitFormData = null
    },
    /**
     * 一键清空所有创建页草稿（localStorage 只删 __oc_create_form_draft__ 这一项）
     */
    clearAllCreateFormDrafts () {
      clearAllDrafts()
      this.draftRestored = false
      this._draftInitFormData = null
    },
    /**
     * 表单变更后防抖写草稿（需 saveOnChange，且用户已交互）
     */
    scheduleSaveCreateFormDraft () {
      if (!this.canUseCreateFormDraft || this.isDraftRestore || !this.createFormDraftUserInteracted) return
      if (!this.isCreateFormDraftSaveOnChangeEnabled()) return
      if (this._createFormDraftSaveTimer) {
        clearTimeout(this._createFormDraftSaveTimer)
      }
      this._createFormDraftSaveTimer = setTimeout(() => {
        this._createFormDraftSaveTimer = null
        this.saveCreateFormDraft()
      }, DEBOUNCE_MS)
    },
  },
}
