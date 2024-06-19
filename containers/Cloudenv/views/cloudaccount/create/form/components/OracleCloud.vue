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
      <a-form-item :label="$t('cloudenv.cloudaccount.region_id')">
        <a-input v-decorator="decorators.region_id" :placeholder="$t('common.tips.input', [$t('cloudenv.cloudaccount.region_id')])" />
      </a-form-item>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" />
      <blocked-resources :decorators="{ isOpenBlockedResources: decorators.isOpenBlockedResources, blockedResources: decorators.blockedResources }" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" />
      <auto-sync :fc="form.fc" :form-layout="formLayout" />
      <read-only />
      <share-mode :fd="form.fd" />
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
            rules: [
              { required: true, message: this.$t('cloudenv.private_pem_message') },
            ],
          },
        ],
        oracle_private_key: [
          'oracle_private_key',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.private_key')]) },
            ],
          },
        ],
        domain: [
          'domain',
          {
            initialValue: {
              key: this.$store.getters.userInfo.projectDomainId,
              label: this.$store.getters.userInfo.projectDomain,
            },
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        region_id: [
          'region_id',
          {
            rules: [
              { required: false, message: this.$t('common.tips.input', [this.$t('cloudenv.cloudaccount.region_id')]) },
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
      },
    }
  },
}
</script>
