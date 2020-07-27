<template>
  <div class="template-preview">
    <a-divider orientation="left">{{$t('k8s.text_116')}}</a-divider>
    <div class="mb-3">
      <span style="font-size: 14px;" class="mr-2">{{$t('k8s.text_117')}}</span>
      <a-select class="w-50" v-model="previewFile" value-key="name" @change="changePreviwFile">
        <a-select-option v-for="item in previewFiles" :value="item.data" :key="item.name">{{ item.name }}</a-select-option>
      </a-select>
    </div>
    <code-mirror v-model="yaml" :options="cmOptions" />
  </div>
</template>

<script>
import { Base64 } from 'js-base64'

export default {
  name: 'K8SChartTemplatePreview',
  props: {
    previewFiles: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      previewFile: '',
      yaml: '',
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
        readOnly: true,
      },
    }
  },
  watch: {
    previewFiles: {
      immediate: true,
      handler (previewFiles) {
        if (previewFiles && previewFiles.length) {
          let defaultFile = previewFiles[0]
          const valueFile = previewFiles.find(val => val.name.endsWith('values.yaml'))
          if (valueFile) defaultFile = valueFile
          this.changePreviwFile(defaultFile.data)
        }
      },
    },
  },
  methods: {
    changePreviwFile (data) {
      this.previewFile = data
      this.yaml = Base64.decode(data)
    },
  },
}
</script>
