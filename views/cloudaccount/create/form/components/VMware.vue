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
        host: [
          'host',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入vCenter地址' },
              { validator: this.$validate(['url', 'IPv4'], true, 'some'), trigger: ['blur', 'change'], message: '请输入域名或者ip' },
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
      keepAliveFields: true,
    }
  },
}
</script>
