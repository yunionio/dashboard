<template>
  <a-form :form="form.fc" v-bind="formItemLayout">
    <a-form-item :label="$t('system.text_101')">
      <a-input :placeholder="$t('system.text_168')" v-decorator="decorators.name" />
    </a-form-item>
    <a-form-item :label="$t('common.description')">
      <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
    </a-form-item>
    <a-form-item :label="$t('system.text_221')">
      <a-input-password :placeholder="$t('system.text_239')" v-decorator="decorators.password" />
    </a-form-item>
    <a-form-item :label="$t('dictionary.domain')" v-if="isAdminMode">
      <base-select
        resource="domains"
        v-decorator="decorators.domain"
        :params="domainParams"
        filterable
        version="v1"
        :showSync="true"
        :select-props="{placeholder: $t('system.text_443', [$t('dictionary.domain')]), labelInValue: true }" />
        <div slot="extra">{{$t('system.text_439')}}<help-link :href="domainCreateLink">{{$t('system.text_128')}}</help-link>
      </div>
    </a-form-item>
    <a-form-item :label="$t('scope.text_245')">
      <a-input :placeholder="$t('system.displayname_tip')" v-decorator="decorators.displayname" />
    </a-form-item>
    <a-form-item :label="$t('system.text_475')">
      <a-switch :checkedChildren="$t('system.text_134')" :unCheckedChildren="$t('system.text_135')" v-decorator="decorators['allow_web_console']" />
      <div slot="extra">{{$t('system.text_481')}}</div>
    </a-form-item>
    <a-form-item :label="$t('system.text_483')">
      <a-switch :checkedChildren="$t('system.text_134')" :unCheckedChildren="$t('system.text_135')" v-decorator="decorators['enable_mfa']" />
      <div slot="extra">{{$t('system.text_484')}}</div>
    </a-form-item>
  </a-form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CreateUser',
  data () {
    // const validatePassword = async (rule, value, callback) => {
    //   if (this.minPasswordLen) {
    //     if (value.length < this.minPasswordLen) return callback(new Error(this.$t('system.text_485', [this.minPasswordLen])))
    //     return callback()
    //   }
    //   const manager = new this.$Manager('services', 'v1')
    //   try {
    //     const response = await manager.list({
    //       params: {
    //         type: 'identity',
    //       },
    //     })
    //     const id = response.data.data && response.data.data[0] && response.data.data[0].id
    //     if (id) {
    //       const configRes = await manager.getSpecific({
    //         id,
    //         spec: 'config',
    //       })
    //       const len = configRes.data.config && configRes.data.config.default && configRes.data.config.default.password_minimal_length
    //       if (len) {
    //         this.minPasswordLen = len
    //         if (value.length < len) return callback(new Error(this.$t('system.text_485', [len])))
    //       }
    //     }
    //     return callback()
    //   } catch (error) {
    //     callback()
    //     throw error
    //   }
    // }
    return {
      minPasswordLen: null,
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
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('system.text_168') },
            ],
          },
        ],
        description: ['description'],
        displayname: [
          'displayname',
          {
            initialValue: '',
            rules: [{ required: false }],
          },
        ],
        password: [
          'password',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('system.text_486'), trigger: 'blur' },
              // { validator: validatePassword, trigger: 'blur' },
            ],
          },
        ],
        domain: [
          'domain',
          {
            // initialValue: { key: this.$store.getters.userInfo.projectDomainId, label: this.$store.getters.userInfo.projectDomain },
            // validateTrigger: 'blur',
            rules: [
              { required: true, message: this.$t('rules.domain') },
            ],
          },
        ],
        allow_web_console: [
          'allow_web_console',
          {
            initialValue: true,
            valuePropName: 'checked',
          },
        ],
        enable_mfa: [
          'enable_mfa',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
      },
      domainParams: {
        scope: this.$store.getters.scope,
        limit: 0,
        enabled: true,
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    domainCreateLink () {
      return this.$router.resolve('/domain/create').href
    },
  },
  methods: {
    validateForm () {
      return this.form.fc.validateFields()
    },
  },
}
</script>
