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
    normalizeUserData (content) {
      if (content == null || content === '') return ''
      if (typeof content === 'string') return content
      // 组件初始值为 []，勿当正文
      if (Array.isArray(content)) return content.length ? content.join('\n') : ''
      return String(content)
    },
    handleRemove (file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
      // file 模式不参与草稿落盘，不 emit content-change
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
        // file 模式不参与草稿落盘，不 emit content-change
      }
      return false
    },
    handleTypeChange () {
      // 草稿回填时 setFieldsValue 会触发 change，勿清空已写入正文
      if (this._restoring) return
      this.errorTip = ''
      this.fileList = []
      this.codeMirrorData = ''
      this.customData = []
      this.$emit('content-change')
    },
    handleCodeInput (_value) {
      this.customData = _value
      this.$emit('content-change')
    },
    handleMirrorDataChange (_value) {
      const text = this.normalizeUserData(_value)
      this.codeMirrorData = text
      this.customData = text
    },
    /**
     * 草稿回填：先设类型，等 CodeMirror 挂载后再写正文（避免 handleTypeChange 清空）
     */
    restoreFromDraft (type, content) {
      // 草稿不处理 file 模式
      if (type === 'file') return
      const customType = type || (content ? 'input' : '')
      if (customType && customType !== 'input') return
      const text = this.normalizeUserData(content)
      this._restoring = true
      this.errorTip = ''
      this.fileList = []
      this.$set(this.form.fd, 'custom_data_type', customType)
      if (this.form.fc) {
        this.form.fc.setFieldsValue({ custom_data_type: customType })
      }
      const applyText = () => {
        if (customType !== 'input' || !text) return
        this.codeMirrorData = text
        this.customData = text
      }
      this.$nextTick(() => {
        applyText()
        this.$nextTick(applyText)
        // 延后解除，避免 setFieldsValue 异步 change 仍清空正文
        setTimeout(() => {
          applyText()
          this._restoring = false
        }, 300)
      })
    },
  },
}
</script>

<style lang="less" scoped>
.err-tip {
  color: red;
}
</style>
