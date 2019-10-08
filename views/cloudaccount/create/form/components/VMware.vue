<template>
  <div>
    <a-form :form="form.fc">
      <a-form-item v-bind="formLayout" label="名称">
        <a-input v-decorator="decorators.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item v-bind="formLayout" label="vCenter地址">
        <a-input v-decorator="decorators.host" placeholder="请输入域名或者ip" />
      </a-form-item>
      <a-form-item v-bind="formLayout" label="端口">
        <a-input v-decorator="decorators.port" />
      </a-form-item>
      <a-form-item v-bind="formLayout">
        <span slot="label">
          {{ keySecretField.label.k }}
          <a-tooltip placement="top">
            <a-icon type="question-circle" color="grey" />
            <div slot="title">
              <a class="link-color" target="_blank" :href="docs[provider.toLowerCase()]">{{ `如何获取${keySecretField.text}的${keySecretField.label.k }？点击查看帮助详情` }}</a>
            </div>
          </a-tooltip>
        </span>
        <a-input v-decorator="decorators.username" :placeholder="keySecretField.placeholder.k" />
      </a-form-item>
      <a-form-item v-bind="formLayout" :label="keySecretField.label.s">
        <a-input v-decorator="decorators.password" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <a-form-item label="指定项目" class="mb-0" v-bind="formLayout">
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
import validateForm, { isRequired } from '@/utils/validate'

export default {
  name: 'VMwareCreate',
  components: {
    AutoSync,
    DomainProject,
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
              { validator: validateForm('serverName') },
            ],
          },
        ],
        host: [
          'host',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入vCenter地址' },
              { validator: validateForm(['url', 'IPv4']), trigger: ['blur', 'change'] },
            ],
          },
        ],
        port: [
          'port',
          {
            initialValue: 443,
            rules: [
              { type: 'number', min: 0, max: 65535, message: '端口范围在 0-65535 之间', trigger: 'blur' },
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
            rules: [
              { validator: isRequired(), message: '请选择域', trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
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
