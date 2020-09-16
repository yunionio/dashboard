<template>
  <div>
    <a-form-item :label="$t('dictionary.domain')" v-bind="formLayout" v-if="isAdminMode && l3PermissionEnable">
      <a-select
        :allowClear="allowClear"
        :labelInValue="labelInValue"
        v-decorator="decorators.domain"
        :loading="domainLoading"
        :placeholder="$t('rules.domain')"
        @change="domainChange"
        :filterOption="filterOption"
        showSearch>
        <a-select-option v-for="item of domains" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="`资源归属${$t('dictionary.project')}`" v-bind="formLayout" :extra="`资源同步会归属至该${$t('dictionary.project')}，若自动创建${$t('dictionary.project')}会根据云上${$t('dictionary.project')}情况归属`">
      <a-select
        :disabled="disableProjectSelect || isOpenstack"
        :allowClear="allowClear"
        :labelInValue="labelInValue"
        v-decorator="decorators.project"
        :loading="projectLoading"
        :placeholder="$t('rules.project')"
        @change="projectChange"
        :filterOption="filterOption"
        showSearch>
        <a-select-option v-for="item of projects" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
      </a-select>
      <div class="d-flex">
        <div class="flex-shrink-0 flex-grow-0">
          <template v-if="isOpenstack">
            <a-tooltip title="OpenStack平台不支持该操作">
              <a-checkbox v-decorator="decorators.auto_create_project" @change="handleAutoCreateProjectChange" disabled>自动创建{{ $t('dictionary.project') }}</a-checkbox>
            </a-tooltip>
          </template>
          <template v-else>
            <a-checkbox v-decorator="decorators.auto_create_project" @change="handleAutoCreateProjectChange">自动创建{{ $t('dictionary.project') }}</a-checkbox>
          </template>
        </div>
        <div class="flex-shrink-0 flex-grow-0 ml-1">
          <help-tooltip name="cloudaccountAutoCreateProject" />
        </div>
      </div>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'DomainProject',
  props: {
    labelInValue: {
      type: Boolean,
      default: true,
    },
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.domain) && R.is(Array, val.project),
    },
    fc: {
      type: Object,
      required: true,
    },
    allowClear: Boolean,
    formLayout: Object,
    provider: {
      type: String,
    },
  },
  data () {
    return {
      domains: [],
      domainLoading: false,
      projectData: {},
      projects: [],
      projectLoading: false,
      disableProjectSelect: false,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    isOpenstack () {
      if (this.provider) {
        return this.provider.toLowerCase() === 'openstack'
      }
      return false
    },
  },
  mounted () {
    this.dm = new Manager('domains', 'v1')
    this.pm = new Manager('projects', 'v1')
    if (this.isAdminMode && this.l3PermissionEnable) {
      this.fetchDomains()
    } else {
      this.fetchProjects('default')
    }
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    /*
     * @params {Object} domain { key: <domainId> }
     */
    _setInitDomain (domain) {
      if (!R.isNil(domain) && !R.isEmpty(domain)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            domain: { key: domain.key, label: domain.label },
          })
        } else {
          this.fc.setFieldsValue({
            domain: domain.key,
          })
        }
      }
    },
    /*
     * @params {Object} project { key: <projectId> }
     */
    _setInitProject (project) {
      if (!R.isNil(project) && !R.isEmpty(project)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            project: { key: project.key, label: project.label },
          })
        } else {
          this.fc.setFieldsValue({
            project: project.key,
          })
        }
      }
    },
    async fetchDomains () {
      if (!this.isAdminMode) {
        const data = [{
          key: this.userInfo.projectDomainId,
          label: this.userInfo.projectDomain,
        }]
        this.domains = data
        this.domainChange(data[0])
        return
      }
      this.domainLoading = true
      try {
        const params = {
          scope: this.scope,
          limit: 0,
          filter: 'enabled.equals(1)', // 仅显示启用状态下的域
        }
        const response = await this.dm.list({ params })
        const data = response.data.data || []
        this.domains = data.map(val => ({ ...val, key: val.id, label: val.name }))
        let defaultData = { key: this.userInfo.projectDomainId, label: this.userInfo.projectDomain }
        if (!this.domains.find(val => val.key === this.userInfo.projectDomainId)) return // 如果下拉列表没有当前域值，return
        const initialValue = _.get(this.decorators, 'domain[1].initialValue')
        if (initialValue) {
          const findInitValue = this.domains.find(val => val.key === (initialValue.key || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.key, label: findInitValue.label }
          }
        }
        this._setInitDomain(defaultData)
        this.domainChange(defaultData || {})
      } catch (error) {
        throw error
      } finally {
        this.domainLoading = false
      }
    },
    async fetchProjects (domainId) {
      if (!this.isAdminMode && !this.isDomainMode) {
        const data = [{
          key: this.userInfo.projectId,
          label: this.userInfo.projectName,
        }]
        this.projects = data
        this.projectChange(data[0])
        this._setInitProject(data[0])
        return
      }
      this.projectLoading = true
      try {
        const params = {
          scope: this.scope,
        }
        if (domainId && !this.isDomainMode) params.domain_id = domainId
        if (this.isAdminMode) {
          params.project_domain = domainId || this.userInfo.projectDomainId
          delete params.scope
          delete params.domain_id
        }
        const response = await this.pm.list({ params })
        const data = response.data.data
        this.projects = data.map(val => ({ ...val, key: val.id, label: val.name })) || []
        let defaultData = { key: this.userInfo.projectId, label: this.userInfo.projectName }
        if (!this.projects.find(val => val.key === this.userInfo.projectId)) { // 如果下拉列表没有当前项目值，取第一个值
          defaultData = this.projects[0]
        }
        const initialValue = _.get(this.decorators, 'project[1].initialValue')
        if (initialValue) {
          const findInitValue = this.projects.find(val => val.key === (initialValue.key || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.key, label: findInitValue.label }
          }
        }
        this.projectChange(defaultData || {})
        this._setInitProject(defaultData || {})
      } catch (error) {
        throw error
      } finally {
        this.projectLoading = false
      }
    },
    /**
     * domain {Object|String}
     */
    domainChange (domain) {
      const domainId = R.is(Object, domain) ? domain.key : domain
      if (domainId) {
        this.fetchProjects(domainId)
        this.fc.setFieldsValue({
          project: undefined,
        })
        this.$emit('update:domain', domainId)
      } else {
        this.fc.setFieldsValue({
          domain: undefined,
          project: undefined,
        })
        this.projects = []
      }
    },
    projectChange (project) {
      this.projectData = project
      this.$emit('update:project', project)
      if (!this.isAdminMode && !this.isDomainMode) {
        this.fc.getFieldDecorator('project', { preserve: true, initialValue: project })
      }
    },
    handleAutoCreateProjectChange (e) {
      const checked = e.target.checked
      this.disableProjectSelect = checked
    },
  },
}
</script>
