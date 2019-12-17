<template>
  <div>
    <a-form :form="form.fc">
      <a-form-item v-bind="formLayout" label="名称">
        <a-input v-decorator="decorators.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item v-bind="formLayout" label="区域">
        <base-select
          :options="environments"
          v-decorator="decorators.environment"
          :selectProps="{ placeholder: '请选择区域' }" />
      </a-form-item>
      <a-form-item v-bind="formLayout">
        <span slot="label">
          租户(Tenant)ID
          <!-- <a-tooltip placement="top">
            <a-icon type="question-circle" color="grey" />
            <div slot="title">
              <a class="link-color" target="_blank" :href="docs[provider.toLowerCase()]">{{ `如何获取${keySecretField.text}的${keySecretField.label.k }？点击查看帮助详情` }}</a>
            </div>
          </a-tooltip> -->
        </span>
        <a-input v-decorator="decorators.directory_id" placeholder="请输入目录ID" />
      </a-form-item>
      <a-form-item v-bind="formLayout" :label="keySecretField.label.k">
        <a-input v-decorator="decorators.username" :placeholder="keySecretField.placeholder.k" />
        <div slot="extra">
          {{ `如何获取${keySecretField.text}的${keySecretField.label.k }？点击查看帮助` }}
          <help-link :href="docs[provider.toLowerCase()]"> 详情</help-link>
        </div>
      </a-form-item>
      <a-form-item v-bind="formLayout" :label="keySecretField.label.s">
        <a-input v-decorator="decorators.password" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <a-form-item label="指定项目" class="mb-0" v-bind="formLayout">
        <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" />
      </a-form-item>
      <auto-sync :fc="form.fc" :form-layout="formLayout" />
      <a-form-item v-bind="formLayout" label="账单密钥">
        <a-input v-decorator="decorators.balanceKey" type="textarea" rows="4" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import { CLOUDACCOUNT_DOCS, keySecretFields, ACCESS_URL } from '@Cloudenv/views/cloudaccount/constants'
import createMixin from './createMixin'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'

export default {
  name: 'AzureCreate',
  components: {
    AutoSync,
    DomainProject,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    const environments = Object.entries(ACCESS_URL[this.provider.toLowerCase()]).map(keyValueArr => ({ key: keyValueArr[0], label: keyValueArr[1] }))
    return {
      formLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 10 },
      },
      docs: CLOUDACCOUNT_DOCS,
      environments,
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
        environment: [
          'environment',
          {
            rules: [
              { required: true, message: '请输入区域', trigger: 'change' },
            ],
          },
        ],
        directory_id: [
          'directory_id',
          {
            rules: [
              { required: true, message: '请输入租户（Tenant）ID', trigger: 'blur' },
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
        balanceKey: [
          'balanceKey',
        ],
      },
    }
  },
}
</script>
