<template>
  <div class="cloudprovider-cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="12" v-if="isAdminMode">
        <a-form-item v-if="l3PermissionEnable" :wrapperCol="{ span: 24 }">
          <a-select :label-in-value="isAdminMode" :filterOption="filterOption" v-decorator="decorators.domain" @change="domainChange" dropdownClassName="oc-select-dropdown" :placeholder="$t('rules.domain')" show-search :loading="domainLoading">
            <a-select-option v-for="item in domainOpts" :key="item.id">
              <span class="text-color-secondary option-prefix">{{$t('dictionary.domain')}}: </span>{{item.value}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-else>
          <!-- <a-radio-group v-decorator="decorators.domain" @change="domainChange">
            <a-radio-button v-for="item in domainOptions" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group> -->
          <a-select :label-in-value="isAdminMode" :filterOption="filterOption" v-decorator="decorators.domain" @change="domainChange" dropdownClassName="oc-select-dropdown" :placeholder="$t('rules.domain')" show-search :loading="domainLoading">
            <a-select-option v-for="item in domainOptions" :key="item.key">
              <span class="text-color-secondary option-prefix">{{$t('dictionary.domain')}}: </span>{{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="isAdminMode?12:24">
        <a-form-item :wrapperCol="{ span: 24 }">
          <div>
            <a-select style="width:calc(100% - 22px)" mode="multiple" :filterOption="filterOption" :label-in-value="labelInValue" v-decorator="decorators.projects" dropdownClassName="oc-select-dropdown" :placeholder="$t('rules.project')" show-search :loading="projectsLoading">
              <a-select-option v-for="item in projectsOpts" :value="item.id" :key="item.id">
                <span class="text-color-secondary option-prefix">{{$t('dictionary.project')}}: </span>{{item.value}}
              </a-select-option>
            </a-select>
            <a-icon type="sync" class="ml-2 primary-color" :spin="projectsLoading" @click="refresh" />
          </div>
        </a-form-item>
      </a-col>
    </a-row>
    <div slot="extra">{{$t('system.text_591',[$t('dictionary.project')])}}<help-link :href="projectCreateLink">{{$t('system.text_440')}}</help-link></div>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'DomainProjectSelect',
  props: {
    labelInValue: {
      type: Boolean,
      default: true,
    },
    projectDomainId: String,
    form: Object,
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.users) && R.is(Array, val.project),
    },
  },
  data () {
    return {
      domainOpts: [],
      projectsOpts: [],
      domainLoading: false,
      projectsLoading: false,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    domainOptions () {
      return [{
        label: 'Default',
        key: 'default',
      }]
    },
    isOpenstack () {
      if (this.provider) {
        return this.provider.toLowerCase() === 'openstack'
      }
      return false
    },
    projectCreateLink () {
      return this.$router.resolve('/project/create').href
    },
    projectsParams () {
      const params = {
        scope: this.scope,
      }
      if (this.l3PermissionEnable) {
        params.project_domain_id = this.projectDomainId || this.userInfo.projectDomainId
        if (params.project_domain_id === 'default') delete params.project_domain_id
      } else {
        params.project_domain_id = this.projectDomainId
      }
      return params
    },
  },
  watch: {
    'projectDomainId' (val) {
      if (val) {
        this.fetchProjects(val)
      }
    },
  },
  created () {
    this.dm = new Manager('domains', 'v1')
    this.um = new Manager('projects', 'v1')
    if (this.isAdminMode) {
      this.fetchDomains()
    } else {
      this.fetchProjects('default')
    }
  },
  mounted () {
  },
  methods: {
    async fetchDomains () {
      if (!this.isAdminMode) {
        const data = [{
          key: this.userInfo.projectDomainId,
          label: this.userInfo.projectDomain,
        }]
        this.domainOpts = data
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
        this.domainOpts = data.map(val => ({ ...val, value: val.name }))
        let defaultData = { id: this.userInfo.projectDomainId, value: this.userInfo.projectDomain }
        if (!this.domainOpts.find(val => val.id === this.userInfo.projectDomainId)) return // 如果下拉列表没有当前域值，return
        const initialValue = _.get(this.decorators, 'domain[1].initialValue')
        if (initialValue) {
          const findInitValue = this.domainOpts.find(val => val.id === (initialValue.id || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.id, label: findInitValue.value }
          }
        }
        if (!R.isNil(defaultData) && !R.isEmpty(defaultData)) {
          if (this.isAdminMode) {
            this.form.fc.setFieldsValue({
              domain: { key: defaultData.key, label: defaultData.label },
            })
          } else {
            this.form.fc.setFieldsValue({
              domain: defaultData.key,
            })
          }
        }
        this.domainChange(defaultData || {})
      } catch (error) {
        throw error
      } finally {
        this.domainLoading = false
      }
    },
    domainChange (domain) {
      const domainId = R.is(Object, domain) ? domain.key : domain
      if (domainId) {
        this.fetchProjects(domainId)
        this.form.fc.setFieldsValue({
          projects: undefined,
        })
        this.$emit('domainChange', domainId)
      } else {
        this.form.fc.setFieldsValue({
          domain: undefined,
          projects: undefined,
        })
        this.projectsOpts = []
      }
    },
    async fetchProjects (domainId) {
      this.projectsLoading = true
      try {
        const response = await this.um.list({
          params: this.projectsParams,
        })
        const data = response.data.data || []
        this.projectsOpts = data.map(val => ({ ...val, value: val.name }))
      } catch (error) {
        throw error
      } finally {
        this.projectsLoading = false
      }
    },
    refresh () {
      this.fetchProjects(this.projectDomainId)
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[1].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
