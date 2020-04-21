<template>
  <div>
    <a-form :form="form.fc"  v-bind="formLayout">
      <a-form-item label="名称">
        <a-input v-decorator="decorators.name" placeholder="请输入名称" />
      </a-form-item>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" />
      <upload-json-file :fc="form.fc">
        <a-form-item label="project_id">
          <a-input v-decorator="decorators.project_id" placeholder="请输入project_id" />
          <div slot="extra">
            {{ `如何获取Google云project_id？点击查看帮助` }}
            <help-link :href="docs['google']"> 详情</help-link>
          </div>
        </a-form-item>
        <a-form-item label="private_key_id">
          <a-input v-decorator="decorators.private_key_id" placeholder="请输入private_key_id" />
        </a-form-item>
        <a-form-item label="private_key">
          <a-textarea :autosize="{ minRows: 3, maxRows: 7 }" v-decorator="decorators.private_key" placeholder="请输入private_key" />
        </a-form-item>
        <a-form-item label="client_email">
          <a-input v-decorator="decorators.client_email" placeholder="请输入client_email" />
        </a-form-item>
      </upload-json-file>
      <proxy-setting :fc="form.fc" ref="proxySetting" />
      <auto-sync :fc="form.fc" :form-layout="formLayout" />
    </a-form>
  </div>
</template>

<script>
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import UploadJsonFile from '@Cloudenv/views/cloudaccount/components/UploadJsonFile'
import { CLOUDACCOUNT_DOCS, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import DomainProject from '../../../components/DomainProject'
import createMixin from './createMixin'
import { isRequired } from '@/utils/validate'

export default {
  name: 'GoogleCreate',
  components: {
    AutoSync,
    DomainProject,
    UploadJsonFile,
    ProxySetting,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    return {
      docs: CLOUDACCOUNT_DOCS,
      keySecretField,
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        project_id: [
          'project_id',
          {
            rules: [
              { required: true, message: '请输入project_id' },
            ],
          },
        ],
        private_key_id: [
          'private_key_id',
          {
            rules: [
              { required: true, message: '请输入private_key_id' },
            ],
          },
        ],
        private_key: [
          'private_key',
          {
            rules: [
              { required: true, message: '请输入private_key' },
            ],
          },
        ],
        client_email: [
          'client_email',
          {
            rules: [
              { required: true, message: '请输入client_email' },
              { type: 'email', message: '请输入正确的邮箱地址' },
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
            valuePropName: 'checked',
          },
        ],
      },
    }
  },
}
</script>
