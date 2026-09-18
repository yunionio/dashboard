<template>
  <div>
    <a-form-item v-if="!inDialog" :label="$t('compute.bastionHost.bastion_host')">
      <a-tooltip
        :title="switchDisabled ? $t('compute.bastionHost.bastion_host.switch_disabled') : null">
        <a-switch
          v-decorator="decorator.bastion_host_enable"
          :checkedChildren="$t('compute.text_115')"
          :unCheckedChildren="$t('compute.text_116')"
          :disabled="switchDisabled"
          @change="changeHandle" />
      </a-tooltip>
    </a-form-item>
    <template v-if="inDialog || bastionHostEnable">
      <a-form-item class="mt-2" :label="inDialog ? $t('compute.bastionHost.bastion_host') : $t('compute.bastionHost.add_bastion_host')">
        <base-select
          v-decorator="decorator.bastion_host_id"
          :options="bastionHosts"
          :filterable="true"
          :select-props="{
            placeholder: $t('compute.bastionHost.bastion_host.placeholder'),
            loading: bastionHostLoading
          }"
          @change="bastionHostChangeHandle" />
      </a-form-item>
      <a-form-item class="mt-2" :label="$t('compute.bastion_host_org')">
        <base-select
          v-decorator="decorator.bastion_org_id"
          :options="orgs"
          :filterable="true"
          :select-props="{
            placeholder: $t('compute.bastionHost.bastion_org.placeholder'),
            loading: orgLoading
          }"
          @change="bastionOrgChangeHandle" />
      </a-form-item>
      <a-form-item class="mt-2" :label="$t('compute.bastionHost.node')">
        <base-select
          v-decorator="decorator.nodes"
          :options="nodes"
          :filterable="true"
          :select-props="{
            placeholder: $t('compute.bastionHost.node.placeholder'),
            allowClear: true,
            mode: 'multiple',
            loading: nodeLoading
          }" />
      </a-form-item>
      <a-form-item class="mt-2" :label="$t('compute.bastionHost.port')">
        <a-input-number
          v-decorator="decorator.port"
          :placeholder="$t('compute.bastionHost.port.placeholder')" />
      </a-form-item>
      <a-form-item class="mt-2" :label="$t('compute.bastionHost.privileged_account')">
        <base-select
          v-decorator="decorator.privileged_accounts"
          :options="privilegedAccounts"
          :filterable="true"
          :select-props="{
            placeholder: $t('compute.bastionHost.privileged_account.placeholder'),
            allowClear: true,
            loading: accountLoading
          }"
          @change="bastionPrivilegedChangeHandle" />
      </a-form-item>
      <a-form-item class="mt-2" :label="$t('compute.bastionHost.account')">
        <base-select
          v-decorator="decorator.accounts"
          :options="accounts"
          :filterable="true"
          :select-props="{
            placeholder: $t('compute.bastionHost.account.placeholder'),
            allowClear: true,
            mode: 'multiple',
            loading: accountLoading
            }" />
      </a-form-item>
      <a-form-item class="mt-2" :label="$t('compute.bastionHost.domain')">
        <base-select
          v-decorator="decorator.bastion_domain_id"
          :options="domains"
          :filterable="true"
          :select-props="{
            placeholder: $t('compute.bastionHost.domain.placeholder'),
            allowClear: true,
            loading: domainLoading
            }"
          @change="bastionDomainChangeHandle" />
      </a-form-item>
    </template>
  </div>
</template>

<script>
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'BastionHost',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    /** selection：开关/单选 select；port 为输入不落盘 */
    formDraftKind: {
      type: String,
      default: 'selection',
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fd && val.fc,
    },
    decorator: {
      type: Object,
      required: true,
    },
    inDialog: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      bastionHostEnable: false,
      bastionHostLoading: false,
      orgLoading: false,
      nodeLoading: false,
      accountLoading: false,
      domainLoading: false,
      orgs: [],
      bastionHosts: [],
      nodes: [],
      privilegedAccounts: [],
      accounts: [],
      domains: [],
      currentBastionHostId: '',
    }
  },
  computed: {
    switchDisabled () {
      return !this.bastionHosts.length
    },
  },
  watch: {
    bastionHostEnable (v) {
      if (v) this.$nextTick(() => this.tryRestoreBastionDraft({ includeHost: true }))
    },
    bastionHosts (list) {
      this.$nextTick(() => {
        this.pruneBastionFieldByOptions('bastion_host_id', list, { idKey: 'id' })
        // 主机列表变化：允许回填主机 + 下游
        if (Array.isArray(list) && list.length) this.tryRestoreBastionDraft({ includeHost: true })
      })
    },
    orgs (list) {
      this.$nextTick(() => {
        this.pruneBastionFieldByOptions('bastion_org_id', list)
        // 下游 opts：只回填下游，不动主机
        if (Array.isArray(list) && list.length) this.tryRestoreBastionDraft({ includeHost: false })
      })
    },
    nodes (list) {
      this.$nextTick(() => {
        this.pruneBastionFieldByOptions('nodes', list, { multiple: true })
      })
    },
    privilegedAccounts (list) {
      this.$nextTick(() => {
        this.pruneBastionFieldByOptions('privileged_accounts', list)
        if (Array.isArray(list) && list.length) this.tryRestoreBastionDraft({ includeHost: false })
      })
    },
    accounts (list) {
      this.$nextTick(() => {
        this.pruneBastionFieldByOptions('accounts', list, { multiple: true })
      })
    },
    domains (list) {
      this.$nextTick(() => {
        this.pruneBastionFieldByOptions('bastion_domain_id', list)
        if (Array.isArray(list) && list.length) this.tryRestoreBastionDraft({ includeHost: false })
      })
    },
  },
  created () {
    // 勿放 data：vue/no-reserved-keys 禁止 data 里用 _ 前缀
    this._bastionDraftWriting = false
    this._fetchedOrgHostId = ''
    this._fetchedCascadeOrgId = ''
    // 字段级 touched：下游手改不挡上游；上游手改可清下游再试回填
    this._bastionFieldTouched = {
      enable: false,
      host: false,
      org: false,
      privileged: false,
      domain: false,
    }
    if (this.isFormDraftKeyWired() || (this.$appConfig.isPrivate && !this.$store.getters.isSysCE)) {
      this.fetchBastionHosts()
    }
  },
  mounted () {
    this.$nextTick(() => this.tryRestoreBastionDraft({ includeHost: true }))
  },
  methods: {
    resetBastionFieldTouched () {
      this._bastionFieldTouched = {
        enable: false,
        host: false,
        org: false,
        privileged: false,
        domain: false,
      }
    },
    isBastionFieldTouched (field) {
      return !!this._bastionFieldTouched?.[field]
    },
    markBastionFieldTouched (field) {
      if (!this._bastionFieldTouched || !field) return
      this._bastionFieldTouched[field] = true
      // 同步页面级 touched，避免 mixin 整包 apply 把开关/结构再盖一遍
      this.markFormFieldDraftTouched()
    },
    clearBastionDownstreamTouched (from) {
      if (!this._bastionFieldTouched) return
      if (from === 'host') {
        this._bastionFieldTouched.org = false
        this._bastionFieldTouched.privileged = false
        this._bastionFieldTouched.domain = false
        return
      }
      if (from === 'org') {
        this._bastionFieldTouched.privileged = false
        this._bastionFieldTouched.domain = false
      }
    },
    sameBastionId (a, b) {
      if (a == null || a === '' || b == null || b === '') return false
      return String(a) === String(b)
    },
    getCurrentBastionHostId () {
      return this.normalizeOptionId(
        this.form?.fc?.getFieldValue?.('bastion_host_id') || this.currentBastionHostId,
      )
    },
    getCurrentBastionOrgId () {
      return this.normalizeOptionId(this.form?.fc?.getFieldValue?.('bastion_org_id'))
    },
    /**
     * opts 为空或当前值不在 opts 中时清空/裁剪对应表单字段（含 nodes、accounts）
     */
    pruneBastionFieldByOptions (field, options, { idKey = 'key', multiple = false } = {}) {
      if (!this.form?.fc || !field || this._bastionDraftWriting) return
      const list = Array.isArray(options) ? options : []
      const cur = this.form.fc.getFieldValue(field)
      const emptyVal = multiple ? [] : undefined
      const isEmptyCur = cur == null || cur === '' || (Array.isArray(cur) && !cur.length)
      if (isEmptyCur) return

      let nextVal
      let needClear = false

      if (!list.length) {
        nextVal = emptyVal
        needClear = true
      } else if (multiple) {
        const raw = Array.isArray(cur) ? cur : [cur]
        const kept = []
        raw.forEach((item) => {
          const id = this.pickValidOptionId(list, item, idKey)
          if (id !== undefined) kept.push(id)
        })
        if (kept.length === raw.length) {
          const same = kept.every((id, i) => this.sameBastionId(id, this.normalizeOptionId(raw[i])))
          if (same) return
        }
        nextVal = kept.length ? kept : emptyVal
        needClear = true
      } else if (this.pickValidOptionId(list, cur, idKey) === undefined) {
        nextVal = emptyVal
        needClear = true
      } else {
        return
      }

      if (!needClear) return

      const patch = { [field]: nextVal }
      // 主机/组织失效时连带清下游，避免节点等残留
      if (field === 'bastion_host_id') {
        Object.assign(patch, {
          bastion_org_id: undefined,
          privileged_accounts: undefined,
          bastion_domain_id: undefined,
          nodes: [],
          accounts: [],
        })
        this.currentBastionHostId = ''
      } else if (field === 'bastion_org_id') {
        Object.assign(patch, {
          privileged_accounts: undefined,
          bastion_domain_id: undefined,
          nodes: [],
          accounts: [],
        })
      }
      this.clearBastionFormFields(patch)
    },
    /** 允许清空 nodes / accounts（setBastionFields 故意不写这两项） */
    clearBastionFormFields (values) {
      if (!this.form?.fc || !values) return
      // setFieldsValue 会忽略 undefined；用 setFields 才能真正清空，从而露出 placeholder
      const fields = {}
      Object.keys(values).forEach((key) => {
        const val = values[key]
        this.ensureFieldDecorator(key, val)
        fields[key] = { value: val }
      })
      this.form.fc.setFields(fields)
      this.syncFormFieldValuesToFd(values)
    },
    normalizeBastionDraft (data) {
      if (!data || typeof data !== 'object') return null
      const next = { ...data }
      // 输入 / 多选：不回填
      delete next.port
      delete next.nodes
      delete next.accounts
      if (Array.isArray(next.privileged_accounts)) {
        next.privileged_accounts = next.privileged_accounts[0]
      }
      if (next.privileged_accounts && typeof next.privileged_accounts === 'object') {
        next.privileged_accounts = next.privileged_accounts.key ?? next.privileged_accounts.id ?? next.privileged_accounts.value
      }
      if (next.bastion_domain_id && typeof next.bastion_domain_id === 'object') {
        next.bastion_domain_id = next.bastion_domain_id.key ?? next.bastion_domain_id.id ?? next.bastion_domain_id.value
      }
      return next
    },
    readBastionDraft () {
      if (!this.canRestoreFormFieldDraft()) return null
      const raw = this.readFormFieldDraft()
      if (!raw?.bastionHostEnable) return null
      return this.normalizeBastionDraft(raw)
    },
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f || !this.bastionHostEnable) return { bastionHostEnable: false }
      return {
        bastionHostEnable: true,
        bastion_host_id: f.getFieldValue('bastion_host_id') || this.currentBastionHostId,
        bastion_org_id: f.getFieldValue('bastion_org_id'),
        // 多选 nodes / accounts、输入 port：不落盘不回填
        privileged_accounts: this.normalizeOptionId(f.getFieldValue('privileged_accounts')),
        bastion_domain_id: this.normalizeOptionId(f.getFieldValue('bastion_domain_id')),
      }
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft?.bastionHostEnable) return
      // 跨 tab：不自动开开关；用户打开后再回填选项
      if (this.isFormFieldDraftFromLocal()) {
        if (!this.bastionHostEnable && !this.inDialog) return
        this.tryRestoreBastionSelections(this.normalizeBastionDraft(draft), { includeHost: true })
        return
      }
      // 用户关过开关：不再强制打开
      if (this.isBastionFieldTouched('enable') && !this.bastionHostEnable && !this.inDialog) return
      this.bastionHostEnable = true
      this.setBastionFields({ bastion_host_enable: true })
      this.$nextTick(() => this.tryRestoreBastionSelections(this.normalizeBastionDraft(draft), { includeHost: true }))
    },
    /**
     * @param {{ includeHost?: boolean }} [options]
     * includeHost=false：下游 opts 变化时只回填下游，禁止写主机
     */
    tryRestoreBastionDraft (options = {}) {
      const draft = this.readBastionDraft()
      if (!draft) return
      if (this.isFormFieldDraftFromLocal() && !this.bastionHostEnable && !this.inDialog) return
      // 用户关过开关：列表 watch 不可再自动打开
      if (!this.bastionHostEnable && !this.inDialog) {
        if (this.isBastionFieldTouched('enable')) return
        this.bastionHostEnable = true
        this.setBastionFields({ bastion_host_enable: true })
      }
      this.tryRestoreBastionSelections(draft, options)
    },
    /**
     * 字段级回填：
     * - includeHost：仅整包/主机列表场景写主机；下游 opts 变化不写上游
     * - 组织：在当前主机 orgs 里 try 草稿（命中才写）
     * - 特权/网域：当前组织与草稿组织一致时再写
     */
    tryRestoreBastionSelections (draft, options = {}) {
      if (!draft || !this.form?.fc) return
      const includeHost = options.includeHost !== false

      if (!this.bastionHosts.length) {
        if (!this.bastionHostLoading) this.fetchBastionHosts()
        return
      }

      const fc = this.form.fc
      const draftHostId = this.pickValidOptionId(this.bastionHosts, draft.bastion_host_id, 'id')

      // —— 主机（仅 includeHost 且未手改）——
      if (includeHost && !this.isBastionFieldTouched('host') && draftHostId) {
        this.currentBastionHostId = draftHostId
        if (!this.sameBastionId(fc.getFieldValue('bastion_host_id'), draftHostId)) {
          this.withBastionDraftWriting(() => {
            this.setBastionFields({ bastion_host_id: draftHostId })
          })
        }
      } else {
        const curHost = this.getCurrentBastionHostId()
        if (curHost) this.currentBastionHostId = curHost
      }

      const currentHostId = this.getCurrentBastionHostId()
      if (!currentHostId) return

      // —— 组织：按当前主机 opts 尝试命中草稿（不因 host≠草稿主机直接放弃）——
      this.ensureBastionOrgsLoaded(currentHostId)
      if (!this.orgs.length) return

      const draftOrgId = draft.bastion_org_id
        ? this.pickValidOptionId(this.orgs, draft.bastion_org_id)
        : undefined
      if (!this.isBastionFieldTouched('org') && draftOrgId) {
        if (!this.sameBastionId(fc.getFieldValue('bastion_org_id'), draftOrgId)) {
          this.withBastionDraftWriting(() => {
            this.setBastionFields({ bastion_org_id: draftOrgId })
          })
        }
      }

      const currentOrgId = this.getCurrentBastionOrgId() || (
        !this.isBastionFieldTouched('org') && draftOrgId ? draftOrgId : undefined
      )
      if (!currentOrgId) return

      this.ensureBastionCascadeLoaded(currentOrgId)
      this.writeBastionSelectionFields(draft)
    },
    ensureBastionOrgsLoaded (hostId) {
      if (!hostId || this.orgLoading) return
      // 仅成功拉取后写入 _fetchedOrgHostId；失败可重试
      if (this._fetchedOrgHostId === hostId) return
      this.fetchOrgs(hostId)
    },
    ensureBastionCascadeLoaded (orgId) {
      if (!orgId || !this.currentBastionHostId) return
      if (this.accountLoading || this.domainLoading || this.nodeLoading) return
      if (this._fetchedCascadeOrgId === orgId) return
      this._fetchedCascadeOrgId = orgId
      this.fetchNodes(orgId)
      this.fetchAllAccounts(orgId)
      this.fetchDomains(orgId)
    },
    withBastionDraftWriting (fn) {
      this._bastionDraftWriting = true
      try {
        fn()
      } finally {
        this.$nextTick(() => {
          this._bastionDraftWriting = false
        })
      }
    },
    writeBastionSelectionFields (draft) {
      if (!draft || !this.form?.fc) return
      const draftOrgId = this.normalizeOptionId(draft.bastion_org_id)
      const currentOrgId = this.getCurrentBastionOrgId()
      // 当前组织与草稿组织不一致：用户在别的组织下，不盖特权/网域
      if (draftOrgId && currentOrgId && !this.sameBastionId(currentOrgId, draftOrgId)) return
      if (draftOrgId && !currentOrgId) return

      const values = {}
      if (!this.isBastionFieldTouched('privileged')) {
        const pid = this.pickValidOptionId(this.privilegedAccounts, draft.privileged_accounts)
        if (pid !== undefined) values.privileged_accounts = pid
      }
      if (!this.isBastionFieldTouched('domain')) {
        const domainId = this.pickValidOptionId(this.domains, draft.bastion_domain_id)
        if (domainId !== undefined) values.bastion_domain_id = domainId
      }
      if (!Object.keys(values).length) return
      this.withBastionDraftWriting(() => {
        this.setBastionFields(values)
        this.$nextTick(() => {
          this._bastionDraftWriting = true
          this.setBastionFields(values)
          this.$nextTick(() => {
            this._bastionDraftWriting = false
          })
        })
      })
    },
    normalizeOptionId (id) {
      if (id == null || id === '') return undefined
      if (Array.isArray(id)) return this.normalizeOptionId(id[0])
      if (typeof id === 'object') return this.normalizeOptionId(id.key ?? id.id ?? id.value)
      return id
    },
    pickValidOptionId (options, id, idKey = 'key') {
      const want = this.normalizeOptionId(id)
      if (want === undefined) return undefined
      const list = Array.isArray(options) ? options : []
      if (!list.length) return undefined
      const hit = list.find(o => {
        const candidates = [o[idKey], o.id, o.key, o.value].filter(v => v != null && v !== '')
        return candidates.some(v => String(v) === String(want))
      })
      if (!hit) return undefined
      return hit[idKey] ?? hit.id ?? hit.key ?? hit.value
    },
    pickValidOptionIds (options, ids, idKey = 'key') {
      if (!Array.isArray(ids)) return undefined
      const list = Array.isArray(options) ? options : []
      if (!list.length) return undefined
      const ret = []
      ids.forEach((raw) => {
        const id = this.pickValidOptionId(list, raw, idKey)
        if (id !== undefined) ret.push(id)
      })
      return ret
    },
    ensureFieldDecorator (field, initialValue) {
      if (!this.form?.fc || !field) return
      const dec = this.decorator?.[field]
      const opts = (Array.isArray(dec) && dec[1]) ? { ...dec[1] } : {}
      if (initialValue !== undefined) opts.initialValue = initialValue
      this.form.fc.getFieldDecorator(field, opts)
    },
    setBastionFields (values) {
      if (!this.form?.fc || !values) return
      // 明确不写 port / 多选 nodes、accounts
      const next = { ...values }
      delete next.port
      delete next.nodes
      delete next.accounts
      Object.keys(next).forEach((key) => {
        if (next[key] !== undefined) this.ensureFieldDecorator(key, next[key])
      })
      this.applyFormFieldValues(next)
    },
    /** 工单回填入口（bastion_server.accounts = [特权, ...普通]） */
    async initData (data) {
      this.resetBastionFieldTouched()
      const hasExplicitPriv = Object.prototype.hasOwnProperty.call(data || {}, 'privileged_accounts')
      const draft = this.normalizeBastionDraft({
        ...data,
        bastionHostEnable: true,
        privileged_accounts: hasExplicitPriv
          ? data.privileged_accounts
          : (Array.isArray(data.accounts) ? data.accounts[0] : undefined),
        accounts: hasExplicitPriv
          ? data.accounts
          : (Array.isArray(data.accounts) ? data.accounts.slice(1) : data.accounts),
      })
      this.bastionHostEnable = true
      this.setBastionFields({ bastion_host_enable: true })
      if (!this.bastionHosts.length) {
        await this.fetchBastionHosts()
      }
      this.tryRestoreBastionSelections(draft, { includeHost: true })
    },
    changeHandle (v) {
      this.bastionHostEnable = v
      // 关闭开关视为手改，避免列表 watch 再自动打开
      if (!v && !this._bastionDraftWriting) {
        this.markBastionFieldTouched('enable')
      }
      if (v && !this.bastionHosts.length && !this.bastionHostLoading) {
        this.fetchBastionHosts()
      }
    },
    bastionHostChangeHandle (v) {
      this.currentBastionHostId = v
      if (this._bastionDraftWriting) return
      // 手改主机：标记 host，清空下游 touched，便于按当前主机再试草稿子项
      this.markBastionFieldTouched('host')
      this.clearBastionDownstreamTouched('host')
      this._fetchedOrgHostId = ''
      this._fetchedCascadeOrgId = ''
      this.withBastionDraftWriting(() => {
        this.clearBastionFormFields({
          bastion_org_id: undefined,
          privileged_accounts: undefined,
          bastion_domain_id: undefined,
          nodes: [],
          accounts: [],
        })
      })
      this.orgs = []
      this.nodes = []
      this.accounts = []
      this.privilegedAccounts = []
      this.domains = []
      this.fetchOrgs(v)
    },
    bastionOrgChangeHandle (v) {
      if (this._bastionDraftWriting) return
      // 手改组织：不碰 host touched；清特权/网域 touched 后可再试回填
      this.markBastionFieldTouched('org')
      this.clearBastionDownstreamTouched('org')
      this._fetchedCascadeOrgId = ''
      this.withBastionDraftWriting(() => {
        this.clearBastionFormFields({
          privileged_accounts: undefined,
          bastion_domain_id: undefined,
          nodes: [],
          accounts: [],
        })
      })
      if (this.currentBastionHostId) {
        this._fetchedCascadeOrgId = v
        this.fetchNodes(v)
        this.fetchAllAccounts(v)
        this.fetchDomains(v)
      } else {
        this.nodes = []
        this.accounts = []
        this.privilegedAccounts = []
        this.domains = []
      }
    },
    bastionPrivilegedChangeHandle () {
      if (this._bastionDraftWriting) return
      this.markBastionFieldTouched('privileged')
    },
    bastionDomainChangeHandle () {
      if (this._bastionDraftWriting) return
      this.markBastionFieldTouched('domain')
    },
    async fetchOrgs (bastionHostId) {
      try {
        this.orgLoading = true
        this.orgs = []
        const { data: { orgs = [] } } = await new this.$Manager('bastion_hosts')
          .getSpecific({ id: bastionHostId, spec: 'bastion-orgs' })
        // BaseSelect 默认 idKey=id / nameKey=name
        this.orgs = orgs.map(o => ({ id: o.id, name: o.name, key: o.id, label: o.name }))
        this._fetchedOrgHostId = bastionHostId
      } catch (error) {
        // 失败不记成功标记，便于后续 ensureBastionOrgsLoaded 重试
        if (this._fetchedOrgHostId === bastionHostId) this._fetchedOrgHostId = ''
        throw error
      } finally {
        this.orgLoading = false
      }
    },
    async fetchBastionHosts () {
      if (this.bastionHostLoading) return
      try {
        this.bastionHostLoading = true
        this.bastionHosts = []
        const { data: { data = [] } } = await new this.$Manager('bastion_hosts').list({})
        this.bastionHosts = data
      } catch (error) {
        throw error
      } finally {
        this.bastionHostLoading = false
      }
    },
    async fetchNodes (bastionOrgId) {
      try {
        this.nodeLoading = true
        this.nodes = []
        const { data: { nodes = [] } } = await new this.$Manager('bastion_hosts')
          .getSpecific({ id: this.currentBastionHostId, spec: 'nodes', params: { bastion_org_id: bastionOrgId } })
        this.nodes = nodes.map(o => ({ id: o.id, name: o.name, key: o.id, label: o.name }))
      } catch (error) {
        throw error
      } finally {
        this.nodeLoading = false
      }
    },
    async fetchAllAccounts (bastionOrgId) {
      try {
        this.accountLoading = true
        this.accounts = []
        this.privilegedAccounts = []
        const { data: { account_templates = [] } } = await new this.$Manager('bastion_hosts')
          .getSpecific({ id: this.currentBastionHostId, spec: 'account-templates', params: { bastion_org_id: bastionOrgId } })
        this.accounts = account_templates.filter(o => !o.privileged).map(o => ({ id: o.id, name: o.name, key: o.id, label: o.name }))
        this.privilegedAccounts = account_templates.filter(o => o.privileged).map(o => ({ id: o.id, name: o.name, key: o.id, label: o.name }))
      } catch (error) {
        if (this._fetchedCascadeOrgId === bastionOrgId) this._fetchedCascadeOrgId = ''
        throw error
      } finally {
        this.accountLoading = false
        const draft = this.readBastionDraft()
        if (draft) this.writeBastionSelectionFields(draft)
      }
    },
    async fetchDomains (bastionOrgId) {
      try {
        this.domainLoading = true
        this.domains = []
        const { data: { domains = [] } } = await new this.$Manager('bastion_hosts')
          .getSpecific({ id: this.currentBastionHostId, spec: 'bastion-domains', params: { bastion_org_id: bastionOrgId } })
        this.domains = domains.map(o => ({ id: o.id, name: o.name, key: o.id, label: o.name }))
      } catch (error) {
        if (this._fetchedCascadeOrgId === bastionOrgId) this._fetchedCascadeOrgId = ''
        throw error
      } finally {
        this.domainLoading = false
        const draft = this.readBastionDraft()
        if (draft) this.writeBastionSelectionFields(draft)
      }
    },
  },
}
</script>

<style></style>
