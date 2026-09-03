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
            placeholder: $t('compute.bastionHost.bastion_host.placeholder'),
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
          }" />
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
            placeholder: $t('common.tips.select', [$t('compute.bastionHost.domain')]),
            allowClear: true,
            loading: domainLoading
            }" />
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
      if (v) this.$nextTick(() => this.tryRestoreBastionDraft())
    },
    bastionHosts (list) {
      if (!Array.isArray(list) || !list.length) return
      this.$nextTick(() => this.tryRestoreBastionDraft())
    },
    orgs (list) {
      if (!Array.isArray(list) || !list.length) return
      this.$nextTick(() => this.tryRestoreBastionDraft())
    },
    nodes (list) {
      if (!Array.isArray(list) || !list.length) return
      this.$nextTick(() => this.tryRestoreBastionDraft())
    },
    privilegedAccounts (list) {
      if (!Array.isArray(list) || !list.length) return
      this.$nextTick(() => this.tryRestoreBastionDraft())
    },
    accounts (list) {
      if (!Array.isArray(list) || !list.length) return
      this.$nextTick(() => this.tryRestoreBastionDraft())
    },
    domains (list) {
      if (!Array.isArray(list) || !list.length) return
      this.$nextTick(() => this.tryRestoreBastionDraft())
    },
  },
  created () {
    // 勿放 data：vue/no-reserved-keys 禁止 data 里用 _ 前缀
    this._bastionDraftWriting = false
    this._fetchedOrgHostId = ''
    this._fetchedCascadeOrgId = ''
    if (this.isFormDraftKeyWired() || (this.$appConfig.isPrivate && !this.$store.getters.isSysCE)) {
      this.fetchBastionHosts()
    }
  },
  mounted () {
    this.$nextTick(() => this.tryRestoreBastionDraft())
  },
  methods: {
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
        this.tryRestoreBastionSelections(this.normalizeBastionDraft(draft))
        return
      }
      this.bastionHostEnable = true
      this.setBastionFields({ bastion_host_enable: true })
      this.$nextTick(() => this.tryRestoreBastionSelections(this.normalizeBastionDraft(draft)))
    },
    /** opts / 开关变化时尝试回填 */
    tryRestoreBastionDraft () {
      const draft = this.readBastionDraft()
      if (!draft) return
      if (this.isFormFieldDraftFromLocal() && !this.bastionHostEnable && !this.inDialog) return
      if (!this.bastionHostEnable && !this.inDialog) {
        this.bastionHostEnable = true
        this.setBastionFields({ bastion_host_enable: true })
      }
      this.tryRestoreBastionSelections(draft)
    },
    /**
     * 按当前已就绪的 opts 尽量回填；缺列表则拉级联，下次 watch 再试
     * 回填：主机 / 组织 / 特权用户 / 网域；不回填：nodes、accounts、port
     */
    tryRestoreBastionSelections (draft) {
      if (!draft || !this.form?.fc) return
      if (!this.bastionHosts.length) {
        if (!this.bastionHostLoading) this.fetchBastionHosts()
        return
      }
      const hostId = this.pickValidOptionId(this.bastionHosts, draft.bastion_host_id, 'id')
      if (!hostId) return

      const fc = this.form.fc
      this.currentBastionHostId = hostId
      // 仅在值变化时写主机/组织，避免反复 set 触发 change → 清空账号列表
      if (String(fc.getFieldValue('bastion_host_id') || '') !== String(hostId)) {
        this.withBastionDraftWriting(() => {
          this.setBastionFields({ bastion_host_id: hostId })
        })
      }

      if (!draft.bastion_org_id) return
      if (!this.orgs.length) {
        if (!this.orgLoading && this._fetchedOrgHostId !== hostId) {
          this._fetchedOrgHostId = hostId
          this.fetchOrgs(hostId)
        }
        return
      }
      const orgId = this.pickValidOptionId(this.orgs, draft.bastion_org_id)
      if (!orgId) return
      if (String(fc.getFieldValue('bastion_org_id') || '') !== String(orgId)) {
        this.withBastionDraftWriting(() => {
          this.setBastionFields({ bastion_org_id: orgId })
        })
      }

      const needAccounts = !!draft.privileged_accounts
      const needDomains = !!draft.bastion_domain_id
      const needFetchCascade = (
        (needAccounts && !this.privilegedAccounts.length && !this.accountLoading) ||
        (needDomains && !this.domains.length && !this.domainLoading)
      )
      if (needFetchCascade && this._fetchedCascadeOrgId !== orgId) {
        this._fetchedCascadeOrgId = orgId
        // 组织变更后仍拉节点/账号列表供手选；仅特权用户、网域会回填
        this.fetchNodes(orgId)
        this.fetchAllAccounts(orgId)
        this.fetchDomains(orgId)
      }

      this.writeBastionSelectionFields(draft)
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
      const values = {}
      const pid = this.pickValidOptionId(this.privilegedAccounts, draft.privileged_accounts)
      if (pid !== undefined) values.privileged_accounts = pid
      const domainId = this.pickValidOptionId(this.domains, draft.bastion_domain_id)
      if (domainId !== undefined) values.bastion_domain_id = domainId
      if (!Object.keys(values).length) return
      this.withBastionDraftWriting(() => {
        this.setBastionFields(values)
        // BaseSelect / 表单项晚挂载时再补一次
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
      this.tryRestoreBastionSelections(draft)
    },
    changeHandle (v) {
      this.bastionHostEnable = v
      if (v && !this.bastionHosts.length && !this.bastionHostLoading) {
        this.fetchBastionHosts()
      }
    },
    bastionHostChangeHandle (v) {
      this.currentBastionHostId = v
      if (this._bastionDraftWriting) return
      this._fetchedOrgHostId = ''
      this._fetchedCascadeOrgId = ''
      this.fetchOrgs(v)
    },
    bastionOrgChangeHandle (v) {
      if (this._bastionDraftWriting) return
      this._fetchedCascadeOrgId = ''
      if (this.currentBastionHostId) {
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
    async fetchOrgs (bastionHostId) {
      try {
        this.orgLoading = true
        this.orgs = []
        const { data: { orgs = [] } } = await new this.$Manager('bastion_hosts')
          .getSpecific({ id: bastionHostId, spec: 'bastion-orgs' })
        // BaseSelect 默认 idKey=id / nameKey=name
        this.orgs = orgs.map(o => ({ id: o.id, name: o.name, key: o.id, label: o.name }))
      } catch (error) {
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
        throw error
      } finally {
        this.accountLoading = false
        // 列表就绪后立刻补写特权/普通账号（不等 watch，避免被其它 set 冲掉）
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
