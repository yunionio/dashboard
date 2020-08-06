<template>
  <div>
    <a-form-item :label="$t('common.text00105')">
      <a-radio-group v-model="formScope" @change="e => emit(e.target.value, 'scope')" :disabled="disabled">
        <a-radio-button
          v-for="item in scopeOptions"
          :value="item.key"
          :key="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('dictionary.domain')" key="domain"  v-if="isDomainScope">
      <base-select
        resource="domains"
        v-decorator="decorators.domain"
        :params="domainParams"
        filterable
        version="v1"
        :disabled="disabled"
        @change="v => emit(v, 'domainId')"
        :select-props="{ placeholder: `${$t('common.text00106')}${$t('dictionary.domain')}` }" />
    </a-form-item>
    <a-form-item :label="$t('dictionary.project')" key="project" v-if="isProjectScope">
      <base-select
        resource="projects"
        v-decorator="decorators.project"
        :labelFormat="projectsLabelFormat"
        :params="projectParams"
        :item.sync="project"
        filterable
        version="v1"
        :need-params="true"
        :disabled="disabled"
        @change="v => emit(v, 'projectId')"
        :select-props="{ placeholder: `${$t('common.text00106')}${$t('dictionary.project')}` }" />
    </a-form-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ScopeRadio',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.domain && val.project,
    },
    formScopeInit: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      formScope: '',
      domainParams: {
        scope: this.scope,
        limit: 0,
      },
      project: {},
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode', 'isDomainMode', 'l3PermissionEnable']),
    isDomainScope () {
      return this.formScope === 'domain'
    },
    isProjectScope () {
      return this.formScope === 'project'
    },
    projectParams () {
      const params = { limit: 0 }
      if (this.isAdminMode) {
        params.scope = 'system'
      } else if (this.isDomainMode) {
        params.project_domain = this.userInfo.domain.id
      }
      return params
    },
    scopeOptions () {
      const ret = [
        { label: this.$t('shareScope.project'), key: 'project' },
      ]
      if (this.isAdminMode) {
        ret.splice(0, 0, { label: this.$t('shareScope.system'), key: 'system' })
        if (this.l3PermissionEnable) {
          ret.splice(1, 0, { label: this.$t('shareScope.domain'), key: 'domain' })
        }
      }
      return ret
    },
  },
  created () {
    this.formScope = this.formScopeInit || this.scopeOptions[0].key
  },
  methods: {
    emit (val, field) {
      const value = {
        scope: this.formScope,
      }
      if (field === 'domainId') {
        value.domain_id = val
      }
      if (field === 'projectId') {
        value.project_id = val
      }
      this.$emit('change', value)
    },
    projectsLabelFormat (item) {
      return <div class='d-flex'>
        <span class='text-truncate flex-fill mr-2' title={ item.name }>{ item.name }</span>
        {(this.isAdminMode && this.l3PermissionEnable) ? <span style="color: #8492a6; font-size: 13px">{this.$t('common_257')}{this.$t('dictionary.domain')}: {item.project_domain}</span> : null}
      </div>
    },
  },
}
</script>
