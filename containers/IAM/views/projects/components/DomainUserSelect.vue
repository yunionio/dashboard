<template>
  <div class="cloudprovider-cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="12" v-if="isAdminMode">
        <a-form-item :wrapperCol="{ span: 24 }">
          <a-select :label-in-value="isAdminMode" :filterOption="filterOption" v-decorator="decorators.domain" @change="domainChange" dropdownClassName="oc-select-dropdown" :placeholder="$t('rules.domain')" show-search :loading="domainLoading">
            <a-select-option v-for="item in domainOpts" :key="item.id">
              <span class="text-color-secondary option-prefix">{{$t('dictionary.domain')}}: </span>{{item.value}}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="!isAdminMode?24:12">
        <a-form-item :wrapperCol="{ span: 24 }">
          <div>
            <a-select style="width:calc(100% - 22px)" mode="multiple" :filterOption="filterOption" :label-in-value="labelInValue" v-decorator="decorators.users" @change="usersChange" dropdownClassName="oc-select-dropdown" :placeholder="$t('rules.user')" show-search :loading="usersLoading">
              <a-select-option v-for="item in usersOpts" :value="item.id" :key="item.id">
                <span class="text-color-secondary option-prefix">{{$t('dictionary.user')}}: </span>{{item.value}}
              </a-select-option>
            </a-select>
            <a-icon type="sync" class="ml-2 primary-color" :spin="usersLoading" @click="refresh" />
          </div>
        </a-form-item>
      </a-col>
    </a-row>
    <div slot="extra">{{$t('system.text_591',[$t('dictionary.user')])}}<help-link :href="userCreateLink">{{$t('system.text_440')}}</help-link></div>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'DomainUserSelect',
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
      usersOpts: [],
      loading: {
        domain: false,
        users: false,
      },
      domainLoading: false,
      usersLoading: false,
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
    userCreateLink () {
      return this.$router.resolve('/systemuser/create').href
    },
    userParams () {
      // 三级权限开：创建default域下的项目时：用户可以选择任意域下的
      const params = {
        scope: this.scope,
        limit: 0,
      }
      if (this.isAdminMode) {
        if (this.l3PermissionEnable) {
          params.domain_id = this.projectDomainId || this.userInfo.projectDomainId
          if (params.domain_id === 'default') delete params.domain_id
        } else {
          params.domain_id = this.projectDomainId
        }
      }
      return params
    },
  },
  watch: {
    'projectDomainId' (val) {
      if (val) {
        this.fetchUsers(val)
      }
    },
  },
  created () {
    this.dm = new Manager('domains', 'v1')
    this.um = new Manager('users', 'v1')
    if (this.isAdminMode) {
      this.fetchDomains()
    } else {
      this.fetchUsers('default')
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
        this.fetchUsers(domainId)
        this.form.fc.setFieldsValue({
          users: undefined,
        })
        this.$emit('domainChange', domainId)
      } else {
        this.form.fc.setFieldsValue({
          domain: undefined,
          users: undefined,
        })
        this.usersOpts = []
      }
    },
    async fetchUsers (domainId) {
      this.usersLoading = true
      try {
        const response = await this.um.list({
          params: this.userParams,
        })
        const data = response.data.data || []
        this.usersOpts = data.map(val => ({ ...val, value: val.name }))
      } catch (error) {
        throw error
      } finally {
        this.usersLoading = false
      }
    },
    refresh () {
      this.fetchUsers(this.projectDomainId)
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[1].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
