<template>
  <div>
    <page-header :title="$t('k8s.text_177')" />
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-form-item
        :label="$t('k8s.text_41')"
        v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('k8s.text_60')" />
      </a-form-item>
      <!-- <a-form-item
        :label="$t('k8s.text_178')"
        :extra="$t('k8s.text_179')<IP>:<Port>/"
        v-bind="formItemLayout">
        <a-input v-decorator="decorators.api_server" :placeholder="$t('k8s.text_180')" />
      </a-form-item> -->
      <a-form-item
        :label="$t('k8s.text_181')"
        v-bind="formItemLayout">
        <code-mirror v-decorator="decorators.kubeconfig" :options="cmOptions" />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 20, offset: 3 }">
        <a-button class="mr-2" type="primary" @click="doImport" :loading="loading">{{$t('k8s.text_143')}}</a-button>
        <a-button @click="cancel">{{$t('k8s.text_162')}}</a-button>
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
          return _callback(this.$t('k8s.text_182'))
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
              { required: true, message: this.$t('k8s.text_60') },
            ],
          },
        ],
        // api_server: [
        //   'api_server',
        //   {
        //     validateTrigger: 'blur',
        //     rules: [
        //       { required: true, message: '请输入API Server 地址' },
        //     ],
        //   },
        // ],
        kubeconfig: [
          'kubeconfig',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('k8s.text_183') },
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
        this.$message.success(this.$t('k8s.text_184'))
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
