<template>
  <div>
    <a-radio-group v-model="range_scope" @change="billingScopeChangeHandler">
      <a-radio-button
        v-for="item in rangeScopeOptions"
        :value="item.value"
        :key="item.value">{{ item.label }}</a-radio-button>
    </a-radio-group>
    <!-- 域选择 -->
    <base-select
      v-if="isShowDomainSelect"
      v-model="domain_id"
      remote
      resource="domains"
      isDefaultSelect
      :params="domainParams"
      @change="domainChangeHandler" />
    <!-- 项目选择 -->
    <base-select
      v-if="isShowProjectSelect"
      v-model="project_id"
      remote
      resource="projects"
      isDefaultSelect
      :params="projectParams"
      @update:item="projectChangeHandler" />
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { getRangeScopeOptions } from '@/utils/rangeScope'

export default {
  name: 'RangeScope',
  props: {
    value: {
      type: Object,
    },
    subscriptionScope: {
      type: String,
      default: 'system',
    },
    hiddenScope: {
      type: Array,
      default () {
        return []
      },
    },
    domain: {
      type: String,
    },
  },
  data () {
    const value = this.value || {}
    return {
      range_scope: value.range_scope,
      domain_id: value.domain_id,
      project_id: value.project_id,
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable', 'scope', 'isAdminMode', 'userInfo']),
    rangeScopeOptions () {
      let options = getRangeScopeOptions.call(this, this.subscriptionScope)
      options = this.hiddenScope.length > 0 ? options.filter(item => !this.hiddenScope.includes(item.value)) : options
      return options.filter(item => {
        if (this.l3PermissionEnable) {
          if (this.scope === 'domain') {
            return item.value === 'domain'
          }
          if (this.scope === 'project') {
            return item.value === 'project'
          }
          return item.scope.includes(this.subscriptionScope)
        }
        if (this.scope === 'domain') {
          return item.value === 'domain'
        }
        if (this.scope === 'project') {
          return item.value === 'project'
        }
        return item.scope.includes(this.subscriptionScope) && !['any_domain', 'domain', 'any_project_in_domain'].includes(item.value)
      })
    },
    isShowDomainSelect () {
      return this.l3PermissionEnable &&
      ['domain', 'any_project_in_domain'].includes(this.range_scope) &&
      this.subscriptionScope === 'system' &&
      this.scope !== 'domain'
    },
    isShowProjectSelect () {
      return this.range_scope === 'project' &&
      this.subscriptionScope !== 'project' &&
      this.scope !== 'project'
    },
    domainParams () {
      return {
        scope: this.scope,
        limit: 20,
      }
    },
    projectParams () {
      const ret = {
        scope: this.scope,
        limit: 20,
      }
      if (this.domain) {
        ret.domain_id = this.domain
      }
      return ret
    },
  },
  watch: {
    value (val = {}) {
      this.range_scope = val.range_scope
      this.domain_id = val.domain_id
      this.project_id = val.project_id
    },
    subscriptionScope (val) {
      const range_scope = val
      this.range_scope = range_scope
      this.triggerChange({ range_scope })
    },
    domain (val) {
      this.triggerChange({ domain_id: val })
    },
  },
  created () {
  },
  methods: {
    billingScopeChangeHandler (e) {
      this.triggerChange({ range_scope: e.target.value })
    },
    domainChangeHandler (domain_id) {
      this.triggerChange({ domain_id })
    },
    projectChangeHandler (projectData) {
      this.triggerChange({ domain_id: projectData.parent_id, project_id: projectData.id })
    },
    triggerChange (changedValue) {
      this.$emit('change', Object.assign({}, _.pick(this.$data, ['range_scope', 'domain_id', 'project_id']), changedValue))
    },
  },
}
</script>

<style></style>
