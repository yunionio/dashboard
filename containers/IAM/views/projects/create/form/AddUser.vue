<template>
  <a-form :form="form.fc" v-bind="formItemLayout">
    <a-form-item :label="$t('dictionary.user')">
      <domain-user-select
          :labelInValue="false"
          :form="form"
          :decorators="decorators"
          :projectDomainId="projectDomainId"
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
import DomainUserSelect from '../../components/DomainUserSelect'

export default {
  name: 'AddUser',
  components: {
    DomainUserSelect,
  },
  props: {
    domainId: {
      type: String,
      default: 'default',
    },
    domainOpt: [],
  },
  data () {
    return {
      projectDomainId: this.domainId,
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
      decorators: {
        domain: [
          'domain',
          {
            initialValue: this.domainId,
          },
        ],
        users: [
          'users',
          {
            rules: [
              { required: true, message: this.$t('rules.user') },
            ],
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
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode', 'userInfo', 'l3PermissionEnable']),
    roleParams () {
      const params = {
        scope: this.scope,
        limit: 0,
      }
      if (this.isAdminMode) {
        if (this.l3PermissionEnable) {
          params.domain_id = this.projectDomainId || this.userInfo.projectDomainId
        } else {
          params.domain_id = this.userInfo.projectDomainId
        }
      }
      return params
    },
    roleLink () {
      return this.$router.resolve('/role').href
    },
  },
  methods: {
    validateForm () {
      return this.form.fc.validateFields()
    },
    domainChange (val) {
      this.projectDomainId = val
    },
  },
}
</script>
