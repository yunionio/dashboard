<template>
  <a-form-item :label="$t('compute.custom_data')" :extra="form.fd.custom_data_type ? customDataExtra : ''">
    <a-radio-group v-decorator="decorators.custom_data_type" class="mb-2" @change="handleTypeChange">
      <a-radio-button value="">{{ $t('compute.text_116') }}</a-radio-button>
      <a-radio-button value="input">{{ $t('compute.custom_data_input') }}</a-radio-button>
      <a-radio-button value="file">{{ $t('compute.custom_data_file') }}</a-radio-button>
    </a-radio-group>
    <div style="max-width: 800px" class="mt-2">
      <code-mirror v-if="form.fd.custom_data_type === 'input'" v-model="codeMirrorData" :options="cmOptions" @input="handleCodeInput" />
    </div>
    <div style="max-width: 800px" class="mt-2 mb-2">
      <a-upload-dragger
        v-if="form.fd.custom_data_type === 'file'"
        list-type="text"
        :beforeUpload="beforeUpload"
        :remove="handleRemove"
        :fileList="fileList"
        :accept="accept">
        <div class="pt-3 pb-3">
          <p class="ant-upload-drag-icon"><a-icon type="inbox" /></p>
          <p class="ant-upload-text">{{$t('system.text_505')}}</p>
          <p class="ant-upload-hint">{{$t('compute.custom_data_file_limit')}}</p>
        </div>
      </a-upload-dragger>
    </div>
    <div v-if="errorTip" class="err-tip">
      {{errorTip}}
    </div>
  </a-form-item>
</template>

<script>
import 'codemirror/theme/material.css'
import 'codemirror/addon/edit/matchbrackets'
import { HYPERVISORS_MAP } from '@/constants'
// import yaml from 'js-yaml'
// import * as R from 'ramda'

export default {
  props: {
    decorators: Object,
    form: Object,
  },
  data () {
    return {
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        theme: 'material',
        mode: 'application/json',
        lint: true,
        matchBrackets: true,
      },
      fileList: [],
      errorTip: '',
      codeMirrorData: '',
      customData: [],
      accept: '.sh,.json,.yaml',
    }
  },
  computed: {
    isKvm () {
      return this.form.fd.hypervisor === 'kvm'
    },
    isEsxi () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.esxi.key
    },
    customDataExtra () {
      return this.isEsxi ? this.$t('compute.custom_data.esxi_extra') : this.$t('compute.custom_data.extra')
    },
  },
  methods: {
    handleRemove (file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUpload (file) {
      if (file.size > 32768) {
        this.$message.error(this.$t('compute.custom_data_file_limit'))
        return false
      }
      var reader = new FileReader()// 这里是核心！！！读取操作就是由它完成的。
      reader.readAsText(file)// 读取文件的内容

      reader.onload = (info) => {
        const result = info.target.result
        this.fileList = [file]
        this.customData = result
      }
      return false
    },
    handleTypeChange () {
      this.errorTip = ''
      this.fileList = []
      this.codeMirrorData = ''
      this.customData = []
    },
    handleCodeInput (_value) {
      this.customData = _value
    },
    handleMirrorDataChange (_value) {
      this.codeMirrorData = _value
    },
  },
}
</script>

<style lang="less" scoped>
.err-tip {
  color: red;
}
</style>
