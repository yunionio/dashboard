<template>
  <div>
    <a-form :form="form.fc"  v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" />
      <upload-json-file :fc="form.fc">
        <a-form-item label="project_id">
          <a-input v-decorator="decorators.project_id" :placeholder="$t('cloudenv.text_247')" />
          <div slot="extra">{{$t('cloudenv.text_248', [ `如何获取Google云project_id？点击查看帮助` ])}}<help-link :href="docs['google']">{{$t('cloudenv.text_237')}}</help-link>
          </div>
        </a-form-item>
        <a-form-item label="private_key_id">
          <a-input v-decorator="decorators.private_key_id" :placeholder="$t('cloudenv.text_162')" />
        </a-form-item>
        <a-form-item label="private_key">
          <a-textarea style="overflow-y:auto" :autosize="{ minRows: 3, maxRows: 35 }" v-decorator="decorators.private_key" :placeholder="$t('cloudenv.text_161')" />
        </a-form-item>
        <a-form-item label="client_email">
          <a-input v-decorator="decorators.client_email" :placeholder="$t('cloudenv.text_249')" />
        </a-form-item>
      </upload-json-file>
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" />
      <auto-sync :fc="form.fc" :form-layout="formLayout" />
      <read-only />
      <share-mode :fd="form.fd" />
    </a-form>
  </div>
</template>

<script>
import DomainProject from '../../../components/DomainProject'
import createMixin from './createMixin'
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import ShareMode from '@Cloudenv/views/cloudaccount/components/ShareMode'
import ReadOnly from '@Cloudenv/views/cloudaccount/components/ReadOnly'
import UploadJsonFile from '@Cloudenv/views/cloudaccount/components/UploadJsonFile'
import { getCloudaccountDocs, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'

export default {
  name: 'GoogleCreate',
  components: {
    AutoSync,
    DomainProject,
    UploadJsonFile,
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
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: ['description'],
        project_id: [
          'gcp_project_id',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_247') },
            ],
          },
        ],
        private_key_id: [
          'gcp_private_key_id',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_162') },
            ],
          },
        ],
        private_key: [
          'gcp_private_key',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_161') },
            ],
          },
        ],
        client_email: [
          'gcp_client_email',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_249') },
              { type: 'email', message: this.$t('cloudenv.text_250') },
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
      },
    }
  },
}
</script>
