<template>
  <a-form :form="form.fc" v-bind="formItemLayout">
    <a-form-item :label="$t('dictionary.project')">
      <domain-project-select
        :labelInValue="false"
        :form="form"
        :decorators="decorators"
        :projectDomainId="domainId"
        @domainChange="domainChange" />
    </a-form-item>
    <a-form-item :label="`${$t('dictionary.role')}`">
      <base-select
        v-decorator="decorators.roles"
        version="v1"
        resource="roles"
        :params="roleParams"
        filterable
        :showSync="true"
        :select-props="{ mode: 'multiple', placeholder: $t('rules.role') }" />
      <div slot="extra">{{$t('system.text_441', [$t('dictionary.role')])}}<help-link :href="roleLink">{{$t('system.text_440')}}</help-link></div>
    </a-form-item>
  </a-form>
</template>

<script>
import { mapGetters } from 'vuex'
import DomainProjectSelect from '../../components/DomainProjectSelect'
// const defaultDomain = { key: 'default', label: 'Default' }

export default {
  name: 'JoinProject',
  components: {
    DomainProjectSelect,
  },
  props: {
    domain: {
      type: Object,
      validator: val => val.key && val.label,
    },
  },
  data () {
    const domainId = this.domain ? this.domain.key : 'default'
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
          xxl: {
            span: 22,
          },
        },
        labelCol: {
          span: 3,
          xxl: {
            span: 2,
          },
        },
      },
      domainId,
      decorators: {
        domain: [
          'domain',
          {
            initialValue: domainId,
          },
        ],
        roles: [
          'roles',
          {
            rules: [
              { required: true, message: this.$t('rules.role') },
            ],
          },
        ],
        projects: [
          'projects',
          {
            rules: [
              { required: true, message: this.$t('rules.project') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['isDomainMode', 'isAdminMode', 'userInfo', 'l3PermissionEnable', 'scope']),
    domainOptions () {
      return [{
        label: 'Default',
        key: 'default',
      }]
    },
    domainParams () {
      return {
        scope: this.scope,
      }
    },
    roleParams () {
      const ret = {
        scope: this.scope,
        limit: 0,
      }
      ret.project_domain_id = this.domainId
      if (ret.project_domain_id === 'default') {
        delete ret.project_domain_id
      }
      return ret
    },
    roleLink () {
      return this.$router.resolve('/role').href
    },
    projectCreateLink () {
      return this.$router.resolve('/project/create').href
    },
  },
  methods: {
    validateForm () {
      return this.form.fc.validateFields()
    },
    domainChange (val) {
      this.domainId = val
    },
  },
}
</script>
