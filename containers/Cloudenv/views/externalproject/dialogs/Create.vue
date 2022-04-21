<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.create_extrnal_project')}}</div>
    <div slot="body">
      <steps class="my-3" v-model="step" />
      <a-form-model
        class="mt-3"
        ref="form"
        :model="fd"
        :rules="rules">
        <a-form-model-item v-if="step.currentStep === 0" prop="extrnal_project_name" :label="$t('cloudenv.text_95')" v-bind="formItemLayout">
          <a-input v-model="fd.extrnal_project_name" />
        </a-form-model-item>
        <a-form-model-item v-if="step.currentStep === 0 && isAzure" prop="provider" :label="$t('dictionary.cloudprovider')" v-bind="formItemLayout">
          <base-select
            v-model="fd.provider"
            :params="cloudproviderParams"
            filterable
            resource="cloudproviders" />
        </a-form-model-item>
        <template v-if="step.currentStep === 1">
          <a-form-model-item :label="$t('cloudenv.text_360')" prop="type" v-bind="formItemLayout">
            <a-radio-group v-model="fd.type">
              <template v-for="item of typeOptions">
                <a-radio-button :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
              </template>
            </a-radio-group>
          </a-form-model-item>
          <template v-if="fd.type === 'select'">
            <a-form-model-item prop="project" :label="params.projectLabel || $t('res.project')" v-bind="formItemLayout">
          <a-row :gutter="8">
            <a-col :span="12">
              <a-select v-model="domain" show-search @search="getConditionDomains" :filter-option="false" allow-clear dropdownClassName="oc-select-dropdown">
                <template v-for="item of domains">
                  <a-select-option :key="item.id" :value="item.id">
                    <span class="text-color-secondary option-prefix">{{ $t('res.domain') }}: </span>{{ item.name }}
                  </a-select-option>
                </template>
              </a-select>
            </a-col>
            <a-col :span="12">
              <a-select v-model="fd.project" show-search @search="fetchProjects" :filter-option="false" allow-clear dropdownClassName="oc-select-dropdown">
                <template v-for="item of projects">
                  <a-select-option :key="item.id" :value="item.id">
                    <span class="text-color-secondary option-prefix">{{ $t('res.project') }}: </span>{{ item.name }}
                  </a-select-option>
                </template>
              </a-select>
            </a-col>
          </a-row>
        </a-form-model-item>
          </template>
          <a-form-model-item v-if="fd.type === 'create'" prop="local_project_name" :label="$t('cloudenv.text_95')" v-bind="formItemLayout">
            <a-input v-model="fd.local_project_name" />
          </a-form-model-item>
        </template>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ createText }}</a-button>
      <a-button @click="cancelDialog">{{ cancelText }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import step from '@/mixins/step'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'ExternalProjectCreateDialog',
  mixins: [DialogMixin, WindowsMixin, step],
  data () {
    return {
      loading: false,
      domain: '',
      domains: [],
      domainLoading: false,
      projects: [],
      fd: {
        extrnal_project_name: '',
        local_project_name: '',
        type: 'select',
        project: '',
      },
      rules: {
        extrnal_project_name: [
          { required: true, message: this.$t('cloudenv.text_190') },
        ],
        local_project_name: [
          { required: true, message: this.$t('cloudenv.text_190') },
        ],
        project: [
          { required: true, message: this.$t('rules.project') },
        ],
        provider: [
          { required: true, message: this.$t('common_588') },
        ],
      },
      formItemLayout: this.params.formItemLayout || {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      step: {
        steps: [
          { title: this.$t('cloudenv.create_extrnal_project'), key: 'create-extrnal' },
          { title: this.$t('cloudenv.link_local_project'), key: 'link-local' },
        ],
        currentStep: 0,
      },
      typeOptions: [
        { key: 'select', label: this.$t('cloudenv.select_local_project') },
        { key: 'create', label: this.$t('cloudenv.create_local_project') },
      ],
      projectMsg: {},
    }
  },
  computed: {
    ...mapGetters(['scope', 'userInfo', 'l3PermissionEnable', 'isAdminMode']),
    createText () {
      return this.step.currentStep ? this.$t('dialog.ok') : this.$t('cloudenv.text_104')
    },
    cancelText () {
      return this.step.currentStep ? this.$t('common.skip') : this.$t('dialog.cancel')
    },
    isAzure () {
      return this.params.cloudaccount && this.params.cloudaccount.provider === HYPERVISORS_MAP.azure.provider
    },
    cloudproviderParams () {
      return {
        scope: this.scope,
        cloudaccount_id: this.params.cloudaccount.id,
      }
    },
  },
  watch: {
    domain (val, oldVal) {
      if (val !== oldVal) {
        this.fd.project = ''
        this.fetchProjects()
      }
    },
  },
  destroyed () {
    this.dm = null
    this.pm = null
  },
  created () {
    this.dm = new this.$Manager('domains', 'v1')
    this.pm = new this.$Manager('projects', 'v1')
    this.getConditionDomains()
  },
  methods: {
    async getConditionDomains (query) {
      // 域管理后台只能选自己所在的domain
      // 全局共享  -> all scope domain
      // 多域共享  -> account domain + share_domains
      const cloudaccountDomain = {
        id: this.params.cloudaccount.domain_id,
        name: this.params.cloudaccount.project_domain,
      }
      if (!this.l3PermissionEnable) {
        const domains = [cloudaccountDomain]
        this.domains = domains
        this.domain = this.domains[0].id
      }
      if (!this.isAdminMode) {
        const domains = [
          {
            name: this.userInfo.projectDomain,
            id: this.userInfo.projectDomainId,
          },
        ]
        this.domains = domains
        this.domain = this.domains[0].id
        return
      }
      const { public_scope = 'none', shared_domains = [] } = this.params.cloudaccount
      let domains = []
      if (public_scope === 'none') {
        domains = [cloudaccountDomain]
      }
      if (public_scope === 'domain') {
        domains = shared_domains
        domains.push(cloudaccountDomain)
      }
      if (public_scope === 'system') {
        this.domainLoading = true
        try {
          const params = {
            scope: this.scope,
            limit: 20,
          }
          if (query) {
            params.filter = `name.contains(${query})`
          }
          const response = await this.dm.list({
            params,
          })
          const data = response.data.data || []
          domains = data
        } catch (error) {
          throw error
        } finally {
          this.domainLoading = false
        }
      }
      this.domains = domains
      this.domain = (this.domains[0] && this.domains[0].id) || ''
    },
    async fetchProjects (query) {
      const params = {
        scope: this.scope,
        domain_id: this.domain,
        limit: 20,
      }
      if (query) {
        params.filter = `name.contains(${query})`
      }
      try {
        const response = await this.pm.list({
          params,
        })
        const projects = response.data.data || []
        if (this.projectMsg.project_id && !this.projects.some(item => item.id === this.projectMsg.project_id)) {
          projects.push({
            id: this.projectMsg.project_id,
            name: this.projectMsg.project,
          })
        }
        this.projects = projects
        this.fd.project = this.projectMsg.project_id || ''
      } catch (error) {
        throw error
      }
    },
    async doCreateExtrnalProject (values) {
      const data = {
        name: values.extrnal_project_name,
        cloudaccount_id: this.params.cloudaccount.id,
      }
      if (this.isAzure) {
        data.manager_id = values.provider
      }
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async doChangeProject (values) {
      return this.params.onManager('batchPerformAction', {
        id: [values.id],
        managerArgs: {
          action: 'change-project',
          data: {
            project: values.project,
          },
        },
      })
    },
    async doCreateLocalProject (values) {
      return this.pm.create({
        data: {
          domain: this.domain,
          name: values.local_project_name,
        },
      })
    },
    async handleConfirm () {
      if (!this.params.cloudaccount) return
      this.loading = true
      try {
        await this.$refs.form.validate()
        if (this.step.currentStep === 0) {
          const { data } = await this.doCreateExtrnalProject(this.fd)
          this.fd.local_project_name = data.name
          this.fd.domain_id = data.domain_id
          this.step.currentStep = 1
          this.projectMsg = { project_id: data.project_id, project: data.project, id: data.id }
        } else if (this.step.currentStep === 1) {
          if (this.fd.type === 'select') {
            await this.doChangeProject({ id: this.projectMsg.id, project: this.fd.project })
          } else {
            const { data } = await this.doCreateLocalProject(this.fd)
            this.projectMsg.project_id = data.id
            this.projectMsg.project = data.name
            await this.doChangeProject({ id: this.projectMsg.id, project: data.id })
          }
          this.cancelDialog()
        }
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
