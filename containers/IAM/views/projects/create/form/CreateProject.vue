<template>
  <a-form :form="form.fc" v-bind="formItemLayout">
    <a-form-item :label="$t('system.text_101')">
      <a-input :placeholder="$t('system.text_168')" v-decorator="decorators.name" />
    </a-form-item>
    <a-form-item :label="$t('common.description')">
      <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
    </a-form-item>
    <a-form-item :label="$t('dictionary.domain')" v-if="$store.getters.isAdminMode && $store.getters.l3PermissionEnable">
      <base-select
        resource="domains"
        v-decorator="decorators.domain_id"
        :params="domainParams"
        remote
        version="v1"
        :showSync="true"
        :select-props="{ placeholder: $t('system.text_443', [$t('dictionary.domain')])}" />
        <div slot="extra">{{$t('system.text_439')}}<help-link :href="domainCreateLink">{{$t('system.text_440')}}</help-link>
      </div>
    </a-form-item>
  </a-form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CreateProject',
  data () {
    return {
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          domain: '',
        },
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
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              {
                required: true, message: this.$t('system.text_170'),
              },
            ],
          },
        ],
        description: ['description'],
        domain_id: [
          'domain_id',
          {
            rules: [
              { required: true, message: this.$t('rules.domain') },
            ],
          },
        ],
      },
      domainParams: {
        scope: this.$store.getters.scope,
        limit: 20,
        enabled: true,
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'l3PermissionEnable', 'userInfo']),
    tenant () {
      return this.$route.query.tenant
    },
    domain () {
      return this.$route.query.domain
    },
    isClone () {
      if (this.$route.query.tenant && this.$route.query.domain) {
        return true
      }
      return false
    },
    domainCreateLink () {
      return this.$router.resolve('/domain/create').href
    },
  },
  created () {
    // 如果 query 携带 tenant 和 domain，表示 clone
    if (this.isClone) {
      // 触发watch获取域quotas，进行上限设置
      this.form.fd.domain = this.domain
    } else if (!this.isAdminMode || !this.l3PermissionEnable) {
      if (!this.l3PermissionEnable) {
        this.form.fd.domain = 'default'
      } else {
        this.form.fd.domain = this.userInfo.projectDomainId
      }
    }
  },
  mounted () {
    this.form.fc.setFieldsValue({ domain_id: this.form.fd.domain })
  },
  methods: {
    validateForm () {
      return this.form.fc.validateFields()
    },
    onValuesChange (props, values) {
      if (values.hasOwnProperty('domain_id')) {
        this.form.fd.domain = values.domain_id
      }
    },
  },
}
</script>
