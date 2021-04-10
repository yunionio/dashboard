<template>
  <div>
    <a-alert :message="$t('k8s.text_286')" banner />
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-form-item
        :label="$t('k8s.text_19')"
        v-bind="formItemLayout">
        <cluster-select
          @input="setCluster"
          :clusterObj.sync="clusterObj"
          v-decorator="decorators.cluster"
          style="width: 140px;" />
      </a-form-item>
      <a-form-item
        :label="$t('k8s.text_287')"
        v-bind="formItemLayout">
        <code-mirror v-decorator="decorators.yaml" :options="cmOptions" />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 20, offset: 3 }">
        <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{$t('k8s.text_288')}}</a-button>
        <a-button @click="cancel">{{$t('k8s.text_162')}}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/theme/material.css'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'InputCreate',
  components: {
    ClusterSelect,
  },
  mixins: [k8sCreateMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        cluster: [
          'cluster',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_30') },
            ],
          },
        ],
        yaml: [
          'yaml',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_289') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      clusterObj: {},
      cmOptions: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        lineWrapping: true,
        theme: 'material',
      },
    }
  },
  created () {
    this.inputM = new this.$Manager('appfromfiles', 'v1')
  },
  destroyed () {
    this.inputM = null
  },
  methods: {
    doCreate (data) {
      return this.inputM.create({
        data: {
          content: data.yaml,
          cluster: data.cluster,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.loading = false
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/k8s-namespace')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/k8s-namespace')
    },
  },
}
</script>
