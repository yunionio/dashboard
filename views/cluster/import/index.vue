<template>
  <div>
    <page-header title="导入集群" />
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-form-item
        label="名称"
        v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item
        label="API Server 地址"
        extra="请输入集群的API Server地址，例如：https://<IP>:<Port>/"
        v-bind="formItemLayout">
        <a-input v-decorator="decorators.api_server" placeholder="请输入API Server 地址" />
      </a-form-item>
      <a-form-item
        label="KubeConfig 配置"
        v-bind="formItemLayout">
        <code-mirror v-decorator="decorators.kubeconfig" :options="cmOptions" />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 20, offset: 3 }">
        <a-button class="mr-2" type="primary" @click="doImport" :loading="loading">导入</a-button>
        <a-button @click="cancel">取消</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { validateYaml } from '@/utils/validate'

export default {
  name: 'ClusterImport',
  data () {
    const validator = (rule, value, _callback) => {
      validateYaml(value)
        .then(() => {
          return _callback()
        })
        .catch(() => {
          return _callback('请输入正确的yaml地址')
        })
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateTrigger: 'blur',
            rules: [
              { required: true, message: '请输入名称' },
            ],
          },
        ],
        api_server: [
          'api_server',
          {
            validateTrigger: 'blur',
            rules: [
              { required: true, message: '请输入API Server 地址' },
            ],
          },
        ],
        kubeconfig: [
          'kubeconfig',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入文件内容' },
              { validator },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
        autofocus: true,
      },
    }
  },
  methods: {
    async doImport () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const data = {
          mode: 'import',
          provider: 'external',
          resource_type: 'unknown',
          ...values,
        }
        await new this.$Manager('kubeclusters', 'v1').create({ data })
        this.loading = false
        this.$message.success('创建成功')
        this.cancel()
      } catch (error) {
        this.loading = false
      }
    },
    cancel () {
      this.$router.push('/k8s-cluster')
    },
  },
}
</script>
