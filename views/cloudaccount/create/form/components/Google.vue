<template>
  <div>
    <a-form :form="form.fc"  v-bind="formLayout">
      <a-form-item label="名称">
        <a-input v-decorator="decorators.name" placeholder="请输入名称" />
      </a-form-item>
       <a-form-item label="指定项目" class="mb-0" v-bind="formLayout">
        <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" />
      </a-form-item>
      <upload-json-file :fc="form.fc">
        <a-form-item label="project_id">
          <a-input v-decorator="decorators.project_id" placeholder="请输入project_id" />
        </a-form-item>
        <a-form-item label="private_key_id">
          <a-input v-decorator="decorators.private_key_id" placeholder="请输入private_key_id" />
        </a-form-item>
        <a-form-item label="private_key">
          <a-textarea style="overflow-y:auto" :autosize="{ minRows: 3, maxRows: 35 }" v-decorator="decorators.private_key" placeholder="请输入private_key" />
        </a-form-item>
        <a-form-item label="client_email">
          <a-input v-decorator="decorators.client_email" placeholder="请输入client_email" />
        </a-form-item>
      </upload-json-file>
      <auto-sync :fc="form.fc" :form-layout="formLayout" />
    </a-form>
  </div>
</template>

<script>
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import UploadJsonFile from '@Cloudenv/views/cloudaccount/components/UploadJsonFile'
import { CLOUDACCOUNT_DOCS, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import createMixin from './createMixin'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'

export default {
  name: 'GoogleCreate',
  components: {
    AutoSync,
    DomainProject,
    UploadJsonFile,
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
          'gcp_project_id',
          {
            rules: [
              { required: true, message: '请输入project_id' },
            ],
          },
        ],
        private_key_id: [
          'gcp_private_key_id',
          {
            rules: [
              { required: true, message: '请输入private_key_id' },
            ],
          },
        ],
        private_key: [
          'gcp_private_key',
          {
            rules: [
              { required: true, message: '请输入private_key' },
            ],
          },
        ],
        client_email: [
          'gcp_client_email',
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
              { validator: isRequired(), message: '请选择域', trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: this.$store.getters.userInfo.projectId,
            rules: [
              { validator: isRequired(), message: '请选择项目', trigger: 'change' },
            ],
          },
        ],
      },
    }
  },
}
</script>
