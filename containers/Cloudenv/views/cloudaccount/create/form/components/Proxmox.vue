<template>
  <div>
    <a-form :form="form.fc" v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_261')" :extra="this.$t('common_572')">
        <a-input v-decorator="decorators.host" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_266')">
        <a-input v-decorator="decorators.port" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.verify_method')">
        <a-radio-group v-decorator="decorators.verify_method" @change="onVerifyMethodChange">
          <a-radio-button v-for="item of verifyMethodOptions" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="keySecretField.label.k">
        <a-input v-decorator="decorators.username" :placeholder="keySecretField.placeholder.k" :suffix="usernameSuffix" />
        <div slot="extra">
           {{$t('cloudenv.text_236', [keySecretField.text, keySecretField.label.k])}}
           <help-link :href="docs[provider.toLowerCase()]">{{$t('cloudenv.text_237')}}</help-link>
        </div>
      </a-form-item>
      <a-form-item :label="keySecretField.label.s">
        <a-input-password v-decorator="decorators.password" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" :cloneData="cloneData" />
      <blocked-resources :decorators="{ isOpenBlockedResources: decorators.isOpenBlockedResources, blockedResources: decorators.blockedResources }" :cloneData="cloneData" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" :cloneData="cloneData" />
      <auto-sync :fc="form.fc" :form-layout="formLayout" :cloneData="cloneData" />
      <share-mode :fd="form.fd" :cloneData="cloneData" />
    </a-form>
  </div>
</template>

<script>
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import ShareMode from '@Cloudenv/views/cloudaccount/components/ShareMode'
import { getCloudaccountDocs, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'
import createMixin from './createMixin'
import DomainProject from '../../../components/DomainProject'

const verifyMethodOptions = [
  { key: 'pam', label: 'PAM' },
  { key: 'pve', label: 'PVE' },
]

export default {
  name: 'ProxmoxCreate',
  components: {
    AutoSync,
    DomainProject,
    ProxySetting,
    ShareMode,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    let initDomain = {
      key: this.$store.getters.userInfo.projectDomainId,
      label: this.$store.getters.userInfo.projectDomain,
    }
    let initHost = ''
    let initPort = 8006
    let initVerifyMethod = verifyMethodOptions[0].key
    const {
      domain_id,
      project_domain,
      auto_create_project: initAutoCreateProject = false,
      account,
      access_url = '',
    } = this.cloneData
    if (domain_id && project_domain) {
      initDomain = {
        key: domain_id,
        label: project_domain,
      }
    }
    if (access_url) {
      const str = access_url.replace('https://', '').replace('http://', '')
      const list = str.split(':')
      initHost = list[0]
      initPort = list[1] || 8006
    }
    if (account && account.includes(verifyMethodOptions[1].key)) {
      initVerifyMethod = verifyMethodOptions[1].key
    }
    return {
      verifyMethodOptions,
      docs: getCloudaccountDocs(this.$store.getters.scope),
      decorators: {
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
        host: [
          'host',
          {
            validateFirst: true,
            initialValue: initHost,
            rules: [
              { required: true, message: this.$t('cloudenv.text_262') },
              { validator: this.$validate(['domain', 'IPv4'], true, 'some'), trigger: ['blur', 'change'], message: this.$t('cloudenv.text_269') },
            ],
          },
        ],
        port: [
          'port',
          {
            initialValue: initPort,
            rules: [
              { type: 'number', min: 0, max: 65535, message: this.$t('cloudenv.text_270'), trigger: 'blur', transform: (v) => parseFloat(v) },
            ],
          },
        ],
        verify_method: [
          'verify_method',
          {
            initialValue: initVerifyMethod,
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
      },
      keepAliveFields: true,
      form: {
        fd: {
          verify_method: initVerifyMethod,
        },
      },
    }
  },
  computed: {
    usernameSuffix () {
      const suffix = this.form.fd.verify_method || verifyMethodOptions[0].key
      return `@${suffix}`
    },
  },
  methods: {
    onVerifyMethodChange (e) {
      this.form.fc.setFieldsValue({ verify_method: e.target.value })
    },
  },
}
</script>
