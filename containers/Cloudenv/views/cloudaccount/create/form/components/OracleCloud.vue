<template>
  <div>
    <a-form :form="form.fc"  v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <a-form-item :label="keySecretField.label.k">
        <a-input v-decorator="decorators.oracle_user_ocid" :placeholder="keySecretField.placeholder.k" />
        <div slot="extra">
          {{$t('cloudenv.text_236', [keySecretField.text, keySecretField.label.k])}}
          <help-link :href="docs[provider.toLowerCase()]">{{$t('cloudenv.text_237')}}</help-link>
        </div>
      </a-form-item>
      <a-form-item :label="keySecretField.label.s">
        <a-input v-decorator="decorators.oracle_tenancy_ocid" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <upload-pem-file :fc="form.fc" :decorators="decorators">
        <a-textarea
          v-decorator="decorators.oracle_private_key"
          :placeholder="$t('common.tips.input', [$t('cloudenv.private_key')])"
          :auto-size="{ minRows: 6, maxRows: 8 }" />
      </upload-pem-file>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" :cloneData="cloneData" />
      <blocked-resources :decorators="{ isOpenBlockedResources: decorators.isOpenBlockedResources, blockedResources: decorators.blockedResources }" :cloneData="cloneData" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" :cloneData="cloneData" />
      <auto-sync :fc="form.fc" :form-layout="formLayout" :cloneData="cloneData" />
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
import UploadPemFile from '@Cloudenv/views/cloudaccount/components/UploadPemFile'
import { getCloudaccountDocs, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'
import createMixin from './createMixin'
import DomainProject from '../../../components/DomainProject'

export default {
  name: 'OracleCloudCreate',
  components: {
    AutoSync,
    DomainProject,
    UploadPemFile,
    ProxySetting,
    ShareMode,
    ReadOnly,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    let initDomain = {
      key: this.$store.getters.userInfo.projectDomainId,
      label: this.$store.getters.userInfo.projectDomain,
    }
    const {
      domain_id,
      project_domain,
      auto_create_project: initAutoCreateProject = false,
      oracle_private_pem: initPrivatePem = '',
      oracle_private_key: initPrivateKey = '',
    } = this.cloneData
    if (domain_id && project_domain) {
      initDomain = {
        key: domain_id,
        label: project_domain,
      }
    }
    return {
      docs: getCloudaccountDocs(this.$store.getters.scope),
      keySecretField,
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
        user: [
          'user',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_260') },
            ],
          },
        ],
        oracle_user_ocid: [
          keySecretField.k,
          {
            rules: [
              { required: true, message: keySecretField.placeholder.k },
            ],
          },
        ],
        oracle_tenancy_ocid: [
          keySecretField.s,
          {
            rules: [
              { required: true, message: keySecretField.placeholder.s },
            ],
          },
        ],
        oracle_private_pem: [
          'oracle_private_pem',
          {
            initialValue: initPrivatePem,
            rules: [
              { required: true, message: this.$t('cloudenv.private_pem_message') },
            ],
          },
        ],
        oracle_private_key: [
          'oracle_private_key',
          {
            initialValue: initPrivateKey,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.private_key')]) },
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
    }
  },
}
</script>
