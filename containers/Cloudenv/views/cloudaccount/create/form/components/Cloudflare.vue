<template>
  <div>
    <a-form :form="form.fc" v-if="decorators" v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <!-- <a-form-item :label="$t('cloudenv.environment')" v-if="isAliyun">
        <base-select
          :options="environments"
          v-decorator="decorators.environment"
          :selectProps="{ placeholder: $t('cloudenv.environment_check') }" />
      </a-form-item> -->
      <a-form-item :label="keySecretField.label.k">
        <a-input v-decorator="decorators.access_key_id" :placeholder="keySecretField.placeholder.k" />
        <div slot="extra">
          {{$t('cloudenv.text_236', [keySecretField.text, keySecretField.label.k])}}
          <help-link :href="docs[provider.toLowerCase()]">{{$t('cloudenv.text_237')}}</help-link>
        </div>
      </a-form-item>
      <a-form-item :label="keySecretField.label.s">
        <a-input-password v-decorator="decorators.access_key_secret" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" :cloneData="cloneData" />
      <blocked-resources :decorators="{ isOpenBlockedResources: decorators.isOpenBlockedResources, blockedResources: decorators.blockedResources }" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" :cloneData="cloneData" />
      <a-form-item :label="$t('cloudaccount.create_form.saml_user_label')" v-if="provider==='Aliyun'">
        <a-switch :checkedChildren="$t('cloudenv.text_84')" :unCheckedChildren="$t('cloudenv.text_85')" v-decorator="decorators.saml_auth" />
        <div slot="extra">
          <i18n path="cloudaccount.create_form.saml_user_extra">
            <template #link>
              <help-link :href="smaluserDoc">{{$t('cloudaccount.create_form.saml_user_link')}}</help-link>
            </template>
          </i18n>
        </div>
      </a-form-item>
      <auto-sync :fc="form.fc" />
      <read-only :cloneData="cloneData" />
      <share-mode :fd="form.fd" :cloneData="cloneData" />
    </a-form>
  </div>
</template>

<script>
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import ShareMode from '@Cloudenv/views/cloudaccount/components/ShareMode'
import ReadOnly from '@Cloudenv/views/cloudaccount/components/ReadOnly'
import { getCloudaccountDocs, keySecretFields, getSamlUserDocs } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'
import createMixin from './createMixin'
import DomainProject from '../../../components/DomainProject'

export default {
  name: 'CloudflareCreate',
  components: {
    AutoSync,
    DomainProject,
    ProxySetting,
    ShareMode,
    ReadOnly,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    // const environments = Object.entries(ACCESS_URL[this.provider.toLowerCase()]).map(keyValueArr => ({ key: keyValueArr[0], label: keyValueArr[1] }))
    return {
      docs: getCloudaccountDocs(this.$store.getters.scope),
      smaluserDoc: getSamlUserDocs(this.$store.getters.scope),
      decorators: this.getDecorators(keySecretField),
      // environments,
    }
  },
  methods: {
    getDecorators (initKeySecretFields) {
      const keySecretField = this.keySecretField || initKeySecretFields
      // let initEnvironment
      let initDomain = {
        key: this.$store.getters.userInfo.projectDomainId,
        label: this.$store.getters.userInfo.projectDomain,
      }
      let initSamlAuth = false
      let initAutoCreateProject = false
      if (this.cloneData) {
        const { domain_id, project_domain, saml_auth = false, auto_create_project = false } = this.cloneData
        // const tEnv = environments.filter(item => item.key === access_url)
        // if (tEnv.length > 0) {
        //   initEnvironment = tEnv[0].key
        // }
        if (domain_id && project_domain) {
          initDomain = {
            key: domain_id,
            label: project_domain,
          }
        }
        initSamlAuth = saml_auth
        initAutoCreateProject = auto_create_project
      }
      const decorators = {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
              // { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: ['description'],
        // environment: [
        //   'environment',
        //   {
        //     initialValue: initEnvironment,
        //     rules: [
        //       { required: true, message: this.$t('cloudenv.environment_check'), trigger: 'change' },
        //     ],
        //   },
        // ],
        access_key_id: [
          keySecretField.k,
          {
            rules: [
              { required: true, message: keySecretField.placeholder.k },
            ],
          },
        ],
        access_key_secret: [
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
            initialValue: initDomain,
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        auto_create_project: [
          'auto_create_project',
          {
            initialValue: initAutoCreateProject,
            valuePropName: 'checked',
          },
        ],
        saml_auth: [
          'saml_auth',
          {
            initialValue: initSamlAuth,
            valuePropName: 'checked',
          },
        ],
      }
      return decorators
    },
  },
}
</script>
