<template>
  <div>
    <a-form :form="form.fc" v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_261')">
        <a-input v-decorator="decorators.host" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_266')">
        <a-input v-decorator="decorators.port" />
      </a-form-item>
      <a-form-item :label="keySecretField.label.k">
        <a-input v-decorator="decorators.username" :placeholder="keySecretField.placeholder.k" />
      </a-form-item>
      <a-form-item :label="keySecretField.label.s">
        <a-input-password v-decorator="decorators.password" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <a-form-item label="Name">
        <a-input v-decorator="decorators.option_name" />
      </a-form-item>
      <a-form-item label="Mon Host" :extra="$t('cloudenv.mon_host_extra')">
        <a-input v-decorator="decorators.mon_host" />
      </a-form-item>
      <a-form-item label="Secret">
        <a-input-password v-decorator="decorators.secret" />
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
import DomainProject from '@Cloudenv/views/cloudaccount/components/DomainProject'
import { getCloudaccountDocs, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'
import regexp from '@/utils/regexp'
import createMixin from './createMixin'

export default {
  name: 'CephFSCreate',
  components: {
    AutoSync,
    DomainProject,
    ProxySetting,
    ShareMode,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    let initHost = ''
    let initPort = ''
    let initMonHost = ''
    let initName = ''
    let initDomain = {
      key: this.$store.getters.userInfo.projectDomainId,
      label: this.$store.getters.userInfo.projectDomain,
    }
    let initAutoCreateProject = false
    if (this.cloneData) {
      const { access_url, domain_id, project_domain, auto_create_project = false, options = {} } = this.cloneData
      if (domain_id && project_domain) {
        initDomain = {
          key: domain_id,
          label: project_domain,
        }
      }
      initAutoCreateProject = auto_create_project
      if (access_url) {
        const str = access_url.replace('https://', '').replace('http://', '')
        const list = str.split(':')
        initHost = list[0]
        initPort = list[1] || 8006
      }
      initMonHost = options.mon_host || ''
      initName = options.name || ''
    }
    return {
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
            initialValue: initPort || 443,
            rules: [
              { type: 'number', min: 0, max: 65535, message: this.$t('cloudenv.text_270'), trigger: 'blur', transform: (v) => parseFloat(v) },
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
        mon_host: [
          'mon_host',
          {
            initialValue: initMonHost,
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (!value) callback()
                  const list = value.split(',')
                  if (list.every(str => {
                    return regexp.isIPv4AndPort(str)
                  })) {
                    callback()
                  }
                  callback(new Error(this.$t('cloudenv.check_mon_host')))
                },
              },
            ],
          },
        ],
        secret: [
          'secret',
        ],
        option_name: [
          'option_name',
          {
            initialValue: initName,
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
    }
  },
}
</script>
