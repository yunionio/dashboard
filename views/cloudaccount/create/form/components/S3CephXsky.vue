<template>
  <div>
    <a-form :form="form.fc">
      <a-form-item v-bind="formLayout" label="名称">
        <a-input v-decorator="decorators.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item v-bind="formLayout" label="接入地址">
        <a-input v-decorator="decorators.endpoint" placeholder="请输入接入地址" />
      </a-form-item>
      <a-form-item v-bind="formLayout" :label="keySecretField.label.k">
        <a-input v-decorator="decorators.username" :placeholder="keySecretField.placeholder.k" />
        <div slot="extra">
          {{ `如何获取${keySecretField.text}的${keySecretField.label.k }？点击查看帮助` }}
          <help-link :href="docs[provider.toLowerCase()]"> 详情</help-link>
        </div>
      </a-form-item>
      <a-form-item v-bind="formLayout" :label="keySecretField.label.s">
        <a-input-password v-decorator="decorators.password" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <a-form-item label="指定项目" class="mb-0" v-bind="formLayout" v-if="domainProjectShow">
        <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" />
      </a-form-item>
      <auto-sync :fc="form.fc" :form-layout="formLayout" />
    </a-form>
  </div>
</template>

<script>
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import { CLOUDACCOUNT_DOCS, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import createMixin from './createMixin'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'

export default {
  name: 'S3CephXsky',
  components: {
    AutoSync,
    DomainProject,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    return {
      docs: CLOUDACCOUNT_DOCS,
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
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        endpoint: [
          'endpoint',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请选择接入地址' },
              { validator: this.$validate('url'), trigger: ['blur'] },
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
      }
      return decorators
    },
  },
}
</script>
