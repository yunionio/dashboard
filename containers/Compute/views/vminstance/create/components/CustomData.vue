<template>
  <a-form-item :label="$t('compute.custom_data')" :extra="isKvm && form.fd.custom_data_type ? extra : null">
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
        :max-count="1"
        :beforeUpload="beforeUpload"
        accept=".json"
        :fileList="fileList">
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
// import yaml from 'js-yaml'
import * as R from 'ramda'

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
      extra: this.$t('compute.custom_data_temp'),
      codeMirrorData: '',
      customData: [],
    }
  },
  computed: {
    isKvm () {
      return this.form.fd.hypervisor === 'kvm'
    },
  },
  methods: {
    beforeUpload (file) {
      if (file.size > 32768) {
        this.$message.error(this.$t('compute.custom_data_file_limit'))
        return false
      }
      var reader = new FileReader()// 这里是核心！！！读取操作就是由它完成的。
      reader.readAsText(file)// 读取文件的内容

      reader.onload = (info) => {
        const json = JSON.parse(info.target.result)
        const isRight = this.checkFileData(json)
        if (!isRight) {
          file.status = 'error'
          this.$message.error(this.$t('compute.custom_data_error1'))
        } else {
          this.fileList = [file]
          this.customData = json
        }
      }
      return false
    },
    checkFileData (json) {
      let isRight = true
      if (R.is(Array, json)) {
        json.map(item => {
          if (!item.path || !item.content || !item.action) {
            isRight = false
          }
        })
      } else {
        return false
      }
      return isRight
    },
    handleTypeChange () {
      this.errorTip = ''
      this.fileList = []
      this.codeMirrorData = ''
      this.customData = []
    },
    async handleInputChange (e) {
      await this.$nextTick()
      const { _value } = e.target
      try {
        const vstr = JSON.stringify(_value)
        const varr = JSON.parse(vstr)
        const isRight = this.checkFileData(varr)
        if (!varr || isRight) {
          this.customData = varr
          this.errorTip = ''
        } else {
          this.errorTip = '格式错误'
        }
      } catch (err) {
        console.error('解析失败')
      }
    },
    handleCodeInput (_value) {
      if (this.isKvm) {
        this.doCheck(_value)
      }
    },
    doCheck (_value) {
      try {
        if (!_value) {
          this.customData = []
          this.errorTip = ''
          return
        }
        const varr = JSON.parse(_value)
        const isRight = this.checkFileData(varr)
        if (isRight) {
          this.customData = varr
          this.errorTip = ''
        } else {
          this.errorTip = this.$t('compute.custom_data_error1')
        }
      } catch (err) {
        this.errorTip = this.$t('compute.custom_data_error1')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.err-tip {
  color: red;
}
</style>
