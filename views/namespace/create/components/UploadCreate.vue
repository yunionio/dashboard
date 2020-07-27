<template>
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
      :label="$t('k8s.text_290')"
      :extra="$t('k8s.text_291')"
      v-bind="formItemLayout">
      <a-upload
        name="file"
        :beforeUpload="beforeUpload"
        :fileList="files"
        v-decorator="decorators.yaml"
        @change="handleFileChange"
        accept="application/x-yaml,application/json">
        <a-button> <a-icon type="upload" />{{$t('k8s.text_292')}}</a-button>
      </a-upload>
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 20, offset: 3 }">
      <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{$t('k8s.text_290')}}</a-button>
      <a-button @click="cancel">{{$t('k8s.text_162')}}</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/theme/material.css'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'UpdateCreate',
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
      files: [],
    }
  },
  created () {
    this.uploadM = new this.$Manager('appfromfiles', 'v1')
    this.form.fc.getFieldDecorator('yaml', { preserve: true, initialValue: '' })
  },
  destroyed () {
    this.uploadM = null
  },
  methods: {
    beforeUpload (file) {
      this.files = [file]
      return false
    },
    handleFileChange ({ fileList }) {
      this.files = [fileList[fileList.length - 1]]
      this.getYamlContent()
    },
    getYamlContent () {
      if (!('FileReader' in window)) {
        return null
      }
      const file = this.files[0]
      if (!file) {
        return null
      }
      const fr = new FileReader()
      fr.readAsText(file.originFileObj)
      fr.onload = (evt) => {
        this.form.fc.setFieldsValue({ yaml: evt.target.result })
      }
      fr.onerror = () => {
        this.$message.error(this.$t('k8s.text_293'))
      }
    },
    doCreate (data) {
      return this.uploadM.create({
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
