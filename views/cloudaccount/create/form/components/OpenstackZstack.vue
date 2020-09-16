<template>
  <div>
    <a-alert v-if="isOpenstack" class="my-2" message="OpenStack账号导入成功后，你需要到存储–块存储列表设置本次导入存储的容量，否则新建虚拟机会失败" banner />
    <a-form :form="form.fc" v-bind="formLayout">
      <a-form-item label="名称">
        <a-input v-decorator="decorators.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item label="认证地址">
        <a-input v-decorator="decorators.auth_url" />
        <span v-if="isOpenstack" slot="extra">
          请输入认证的URL地址，例如：http|https://ip:port/v3
        </span>
        <span v-else slot="extra">
          请输入认证的URL地址，例如：http|https://192.168.1.1:8080
        </span>
      </a-form-item>
      <a-form-item :label="keySecretField.label.k">
        <a-input v-decorator="decorators.username" :placeholder="keySecretField.placeholder.k" />
        <div slot="extra">
          {{ `如何获取${keySecretField.text}的${keySecretField.label.k }？点击查看帮助` }}
          <help-link :href="docs[provider.toLowerCase()]"> 详情</help-link>
        </div>
      </a-form-item>
      <a-form-item :label="keySecretField.label.s">
        <a-input-password v-decorator="decorators.password" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <a-form-item label="项目"  v-if="isOpenstack">
        <a-input v-decorator="decorators.project_name" placeholder="请输入OpenStack的项目，如：admin" />
      </a-form-item>
      <a-form-item label="Domain Name"  v-if="isOpenstack">
        <a-input v-decorator="decorators.domain_name" />
      </a-form-item>
      <domain-project :provider="provider" :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" />
      <auto-sync :fc="form.fc" :form-layout="formLayout" />
    </a-form>
  </div>
</template>

<script>
import DomainProject from '../../../components/DomainProject'
import createMixin from './createMixin'
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import { CLOUDACCOUNT_DOCS, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'

export default {
  name: 'OpenstackZstack',
  components: {
    AutoSync,
    DomainProject,
    ProxySetting,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    return {
      docs: CLOUDACCOUNT_DOCS,
      decorators: this.getDecorators(keySecretField),
    }
  },
  computed: {
    isOpenstack () {
      return this.provider.toLowerCase() === 'openstack'
    },
    urlPlaceholder () {
      if (this.isOpenstack) {
        return '例如：http://host:port/v3'
      }
      return '例如：http://host:8080/'
    },
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
        auth_url: [
          'auth_url',
          {
            rules: [
              { required: true, message: '请选择认证地址' },
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
        project_name: [
          'project_name',
          {
            rules: [
              { required: true, message: '请输入项目' },
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
            initialValue: this.isOpenstack,
            valuePropName: 'checked',
          },
        ],
      }
      return decorators
    },
  },
}
</script>
