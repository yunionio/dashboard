<template>
  <div class="cloudprovider-cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="12" v-if="isAdminMode">
        <a-form-item>
          <base-select
            v-decorator="decorators.domain"
            resource="domains"
            filterable
            remote
            is-default-select
            :select-props="{labelInValue: isAdminMode, labelInValueKeyName: 'key', dropdownClassName: 'oc-select-dropdown', placeholder: $t('rules.domain')}"
            :params="domainParams"
            @change="domainChange">
            <template #optionLabelTemplate="{item}">
              <span class="text-color-secondary option-prefix">{{$t('dictionary.domain')}}: </span>{{item.name}}
            </template>
          </base-select>
        </a-form-item>
      </a-col>
      <a-col :span="isAdminMode?12:24">
        <a-form-item :wrapperCol="{ span: 24 }">
          <base-select
            v-decorator="decorators.projects"
            resource="projects"
            filterable
            remote
            :select-props="{labelInValue: labelInValue, labelInValueKeyName: 'key', dropdownClassName: 'oc-select-dropdown', placeholder: $t('rules.project'), mode: 'multiple'}"
            :params="projectsParams">
            <template #optionLabelTemplate="{item}">
              <span class="text-color-secondary option-prefix">{{$t('dictionary.project')}}: </span>{{item.name}}
            </template>
          </base-select>
        </a-form-item>
      </a-col>
    </a-row>
    <div slot="extra">{{$t('system.text_591',[$t('dictionary.project')])}}<help-link :href="projectCreateLink">{{$t('system.text_440')}}</help-link></div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'

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
    domainParams () {
      const ret = {
        scope: this.scope,
        limit: 20,
        enabled: true,
      }
      if (!this.l3PermissionEnable) {
        ret.id = 'default'
      } else {
        if (!this.isAdminMode) {
          ret.id = this.userInfo.projectDomainId
        }
      }
      return ret
    },
    projectsParams () {
      const params = {
        scope: this.scope,
        limit: 20,
      }
      if (this.l3PermissionEnable) {
        params.project_domain_id = this.projectDomainId || this.userInfo.projectDomainId
      } else {
        params.project_domain_id = this.projectDomainId
      }
      if (this.isDomainMode) {
        delete params.project_domain_id
      }
      return params
    },
  },
  mounted () {
  },
  methods: {
    domainChange (domain) {
      const domainId = R.is(Object, domain) ? domain.key : domain
      if (domainId) {
        this.$emit('domainChange', domainId)
      }
    },
  },
}
</script>
