<template>
  <div class="K8S-source-information-sidepage mb-5 mt-2">
    <code-mirror v-model="text" :options="cmOptions" />
    <a-button
      class="mt-2 mr-2"
      v-clipboard:copy="text"
      v-clipboard:success="_ => $message.success($t('k8s.text_31'))"
      v-clipboard:error="_ => $message.error($t('k8s.text_32'))"><a-icon type="copy" />{{$t('k8s.text_33')}}</a-button>
    <a-button type="primary" @click="update">{{$t('k8s.text_95')}}</a-button>
  </div>
</template>

<script>
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/theme/material.css'
import jsYaml from 'js-yaml'

export default {
  name: 'K8SSourceInformationSidepage',
  props: {
    resource: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      cmOptions: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        lineWrapping: true,
        theme: 'material',
      },
      text: '',
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      const params = {}
      new this.$Manager(this.resource, 'v1').getSpecific({
        id: this.data.id,
        spec: 'rawdata',
        params,
      }).then(({ data }) => {
        this.text = jsYaml.safeDump(data, { lineWidth: Infinity })
      })
    },
    update () {
      const resource = this.resource
      const data = jsYaml.safeLoad(this.text)
      new this.$Manager(resource, 'v1').update({
        id: `${this.data.id}/rawdata`,
        data,
      }).then(({ data }) => {
        this.$message.success(this.$t('k8s.text_96', [this.data.name]))
      })
    },
  },
}
</script>

<style lang="less" scoped>
.K8S-source-information-sidepage {
  ::v-deep .CodeMirror {
    height: 500px;
  }
}
</style>
