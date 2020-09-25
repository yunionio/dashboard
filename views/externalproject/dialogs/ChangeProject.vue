<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="title" :name="name" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        ref="form"
        :model="fd"
        :rules="rules">
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
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ExternalProjectSwitchLocalDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      domain: '',
      domains: [],
      domainLoading: false,
      projects: [],
      fd: {
        project: '',
      },
      rules: {
        project: [
          { required: true, message: this.$t('rules.project') },
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
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'l3PermissionEnable', 'isAdminMode']),
    isBatch () {
      return this.params.data.length > 1
    },
    name () {
      return this.params.name || this.$t('common.text00006')
    },
    title () {
      return this.params.title || this.$t('common_641', [this.$t('dictionary.project')])
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
      let initDomainId = ''
      if (!this.isBatch && !this.initDomainIdFlag) {
        if (this.params.data[0].domain_id && this.params.data[0].project_domain) {
          const selectedDomain = {
            id: this.params.data[0].domain_id,
            name: this.params.data[0].project_domain,
          }
          const fined = !!R.find(R.propEq('id', selectedDomain.id))(domains)
          if (!fined) {
            if (!query || (query && selectedDomain.name.includes(query))) {
              domains.push(selectedDomain)
              initDomainId = selectedDomain.id
              this.initDomainIdFlag = true
            }
          } else {
            initDomainId = selectedDomain.id
            this.initDomainIdFlag = true
          }
        }
      }
      this.domains = domains
      this.domain = initDomainId || ((this.domains[0] && this.domains[0].id) || '')
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
        let initProjectId = ''
        if (!this.isBatch && !this.initProjectIdFlag) {
          if (this.params.data[0].project_id && this.params.data[0].project) {
            const selectedProject = {
              id: this.params.data[0].tenant_id,
              name: this.params.data[0].project,
            }
            const finded = !!R.find(R.propEq('id', selectedProject.id))(projects)
            if (!finded) {
              if (!query || (query && selectedProject.name.includes(query))) {
                projects.push(selectedProject)
                initProjectId = selectedProject.id
                this.initProjectIdFlag = true
              }
            } else {
              initProjectId = selectedProject.id
              this.initProjectIdFlag = true
            }
          }
        }
        this.projects = projects
        this.fd.project = initProjectId || ((this.projects[0] && this.projects[0].id) || '')
      } catch (error) {
        throw error
      }
    },
    async doChangeProject (values, ids) {
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: this.params.steadyStatus || ['running', 'ready'],
        managerArgs: {
          action: this.params.action || 'change-project',
          data: values,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        const ids = this.params.data.map(item => item.id)
        this.loading = true
        await this.doChangeProject(this.fd, ids)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
