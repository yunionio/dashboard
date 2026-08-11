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
      if (v) {
        this.fetchBastionHosts()
      }
    },
  },
  created () {
    if (this.$appConfig.isPrivate && !this.$store.getters.isSysCE) {
      this.fetchBastionHosts()
    }
  },
  methods: {
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f || !this.bastionHostEnable) return { bastionHostEnable: false }
      return {
        bastionHostEnable: true,
        bastion_host_id: f.getFieldValue('bastion_host_id') || this.currentBastionHostId,
        bastion_org_id: f.getFieldValue('bastion_org_id'),
        nodes: f.getFieldValue('nodes'),
        accounts: f.getFieldValue('accounts'),
        bastion_domain_id: f.getFieldValue('bastion_domain_id'),
      }
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft?.bastionHostEnable) return
      if (typeof this.initData === 'function') this.initData(draft)
    },
    /** 列表非空且命中才回填；空列表不写草稿 */
    pickValidOptionId (options, id, idKey = 'key') {
      if (id == null || id === '') return undefined
      const list = Array.isArray(options) ? options : []
      if (!list.length) return undefined
      return list.some(o => (o[idKey] ?? o.id) === id) ? id : undefined
    },
    pickValidOptionIds (options, ids, idKey = 'key') {
      if (!Array.isArray(ids)) return undefined
      const list = Array.isArray(options) ? options : []
      if (!list.length) return undefined
      const set = new Set(list.map(o => o[idKey] ?? o.id))
      return ids.filter(id => set.has(id))
    },

    async initData (data) {
      this.bastionHostEnable = true
      if (this.form?.fc) {
        this.form.fc.setFieldsValue({ bastion_host_enable: true })
      }
      if (!this.bastionHosts.length) {
        await this.fetchBastionHosts()
      }
      const hostId = this.pickValidOptionId(this.bastionHosts, data.bastion_host_id, 'id')
      if (!hostId) {
        this.currentBastionHostId = ''
        return
      }
      this.currentBastionHostId = hostId
      if (this.form?.fc) {
        this.form.fc.setFieldsValue({ bastion_host_id: hostId })
      }
      this.fetchOrgs(hostId, data.bastion_org_id)
      this.fetchNodes(data.bastion_org_id, data.nodes)
      this.fetchAllAccounts(data.bastion_org_id, data.accounts)
      this.fetchDomains(data.bastion_org_id, data.bastion_domain_id)
    },
    changeHandle (v) {
      this.bastionHostEnable = v
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
    },
    bastionHostChangeHandle (v) {
      this.currentBastionHostId = v
      this.fetchOrgs(v)
    },
    bastionOrgChangeHandle (v) {
      if (this.currentBastionHostId) {
        this.fetchNodes(v)
        this.fetchAllAccounts(v)
        this.fetchDomains(v)
      } else {
        this.nodes = []
        this.accounts = []
        this.domains = []
      }
    },
    async fetchOrgs (bastionHostId, defaultOrgId) {
      try {
        this.orgLoading = true
        this.orgs = []
        const { data: { orgs = [] } } = await new this.$Manager('bastion_hosts')
          .getSpecific({ id: bastionHostId, spec: 'bastion-orgs' })
        this.orgs = orgs.map(o => {
          return {
            key: o.id,
            label: o.name,
          }
        })
        this.form.fc.setFieldsValue({
          bastion_org_id: this.pickValidOptionId(this.orgs, defaultOrgId),
        })
      } catch (error) {
        throw error
      } finally {
        this.orgLoading = false
      }
    },
    async fetchBastionHosts () {
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
    async fetchNodes (bastionOrgId, defaultNodes) {
      try {
        this.nodeLoading = true
        this.nodes = []
        const { data: { nodes = [] } } = await new this.$Manager('bastion_hosts')
          .getSpecific({ id: this.currentBastionHostId, spec: 'nodes', params: { bastion_org_id: bastionOrgId } })
        this.nodes = nodes.map(o => {
          return {
            key: o.id,
            label: o.name,
          }
        })
        this.form.fc.setFieldsValue({
          nodes: this.pickValidOptionIds(this.nodes, defaultNodes),
        })
      } catch (error) {
        throw error
      } finally {
        this.nodeLoading = false
      }
    },
    async fetchAllAccounts (bastionOrgId, defaultAccounts = []) {
      try {
        this.accountLoading = true
        this.accounts = []
        this.privilegedAccounts = []
        const { data: { account_templates = [] } } = await new this.$Manager('bastion_hosts')
          .getSpecific({ id: this.currentBastionHostId, spec: 'account-templates', params: { bastion_org_id: bastionOrgId } })
        this.accounts = account_templates.filter(o => !o.privileged).map(o => {
          return {
            key: o.id,
            label: o.name,
          }
        })
        this.privilegedAccounts = account_templates.filter(o => o.privileged).map(o => {
          return {
            key: o.id,
            label: o.name,
          }
        })
        const privilegedAccounts = defaultAccounts.length ? defaultAccounts[0] : undefined
        const accounts = defaultAccounts.filter((_, index) => index !== 0)
        this.form.fc.setFieldsValue({
          accounts: this.pickValidOptionIds(this.accounts, accounts),
          privileged_accounts: this.pickValidOptionId(this.privilegedAccounts, privilegedAccounts),
        })
      } catch (error) {
        throw error
      } finally {
        this.accountLoading = false
      }
    },
    async fetchDomains (bastionOrgId, defaultDomainId) {
      try {
        this.domainLoading = true
        this.domains = []
        const { data: { domains = [] } } = await new this.$Manager('bastion_hosts')
          .getSpecific({ id: this.currentBastionHostId, spec: 'bastion-domains', params: { bastion_org_id: bastionOrgId } })
        this.domains = domains.map(o => {
          return {
            key: o.id,
            label: o.name,
          }
        })
        this.form.fc.setFieldsValue({
          bastion_domain_id: this.pickValidOptionId(this.domains, defaultDomainId),
        })
      } catch (error) {
        throw error
      } finally {
        this.domainLoading = false
      }
    },
  },
}
</script>

<style></style>
