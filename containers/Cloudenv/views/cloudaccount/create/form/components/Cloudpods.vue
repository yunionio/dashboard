<template>
  <div>
    <a-form :form="form.fc" v-if="decorators" v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_253')">
        <a-input v-decorator="decorators.auth_url" />
        <span slot="extra">
          {{$t('common_569')}}
        </span>
      </a-form-item>
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
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" />
      <auto-sync :fc="form.fc" />
    </a-form>
  </div>
</template>

<script>
import DomainProject from '../../../components/DomainProject'
import createMixin from './createMixin'
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import { getCloudaccountDocs, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'

export default {
  name: 'Cloudpods',
  components: {
    AutoSync,
    DomainProject,
    ProxySetting,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    return {
      docs: getCloudaccountDocs(this.$store.getters.scope),
      decorators: this.getDecorators(keySecretField),
    }
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
        auth_url: [
          'auth_url',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_258') },
              { validator: this.$validate('url') },
            ],
          },
        ],
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
        project_name: [
          'project_name',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_259') },
            ],
          },
        ],
        domain_name: [
          'domain_name',
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
        project: [
          'project',
          {
            initialValue: this.$store.getters.userInfo.projectId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        auto_create_project: [
          'auto_create_project',
          {
            initialValue: this.provider.toLowerCase() === 'openstack',
            valuePropName: 'checked',
          },
        ],
      }
      return decorators
    },
  },
}
</script>
