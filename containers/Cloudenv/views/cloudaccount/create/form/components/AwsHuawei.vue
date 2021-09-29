<template>
  <div>
    <a-form :form="form.fc" v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.environment')">
        <base-select
          :options="environments"
          v-decorator="decorators.environment"
          :selectProps="{ placeholder: $t('cloudenv.environment_check') }" />
      </a-form-item>
      <a-form-item :label="keySecretField.label.k">
        <a-input v-decorator="decorators.username" :placeholder="keySecretField.placeholder.k" />
        <div slot="extra">
          {{$t('cloudenv.text_236', [keySecretField.text, keySecretField.label.k])}}
          <help-link :href="docs[provider.toLowerCase()]">{{$t('cloudenv.text_237')}}</help-link>
        </div>
      </a-form-item>
      <a-form-item :label="keySecretField.label.s">
        <a-input-password v-decorator="decorators.password" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" />
      <a-form-item :label="$t('cloudaccount.create_form.saml_user_label')" v-show="!isNotSupportSaml">
        <a-switch :checkedChildren="$t('cloudenv.text_84')" :unCheckedChildren="$t('cloudenv.text_85')" v-decorator="decorators.saml_auth" />
        <div slot="extra">
          <i18n path="cloudaccount.create_form.saml_user_extra">
            <template #link>
              <help-link :href="smaluserDoc">{{$t('cloudaccount.create_form.saml_user_link')}}</help-link>
            </template>
          </i18n>
        </div>
      </a-form-item>
      <auto-sync :fc="form.fc" :form-layout="formLayout" />
    </a-form>
  </div>
</template>

<script>
import DomainProject from '../../../components/DomainProject'
import createMixin from './createMixin'
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import { getCloudaccountDocs, keySecretFields, ACCESS_URL, getSamlUserDocs } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'
import { PROVIDER_MAP } from '@/constants'

export default {
  name: 'AwsHuawei',
  components: {
    AutoSync,
    DomainProject,
    ProxySetting,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    console.log(ACCESS_URL, keySecretFields, this.provider)
    const environments = Object.entries(ACCESS_URL[this.provider.toLowerCase()]).map(keyValueArr => ({ key: keyValueArr[0], label: keyValueArr[1] }))
    return {
      docs: getCloudaccountDocs(this.$store.getters.scope),
      smaluserDoc: getSamlUserDocs(this.$store.getters.scope),
      decorators: this.getDecorators(keySecretField),
      environments,
    }
  },
  computed: {
    isNotSupportSaml () {
      const providers = [PROVIDER_MAP.Ctyun.key]
      return providers.includes(this.provider)
    },
  },
  deactivated () {
    this.form.fc.resetFields()
  },
  methods: {
    getDecorators (initKeySecretFields) {
      const keySecretField = this.keySecretField || initKeySecretFields
      const decorators = {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        environment: [
          'environment',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.environment_check'), trigger: 'change' },
            ],
          },
        ],
        username: [
          keySecretField.k,
          {
            rules: [
              { required: true, message: keySecretField.placeholder.k },
            ],
          },
        ],
        password: [
          keySecretField.s,
          {
            rules: [
              { required: true, message: keySecretField.placeholder.s },
            ],
          },
        ],
        domain: [
          'domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        auto_create_project: [
          'auto_create_project',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
        saml_auth: [
          'saml_auth',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
      }
      return decorators
    },
  },
}
</script>
