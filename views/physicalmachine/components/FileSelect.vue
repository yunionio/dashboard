<template>
  <a-form-item :wrapper-col="offsetWrapperCol">
    <a-alert type="warning" class="mb-2">
      <template v-slot:message>
        <p>上传文件格式支持xlsx，大小不超过2MB</p>
        <p>物理机注册 会按照预定模板扫描上传的文件，并导入数据<a-button type="link" @click="handleDownloadTemplate">下载模板</a-button></p>
        <p>请将所有的物理机记录信息放在同一个sheet页</p>
      </template>
    </a-alert>
    <a-upload-dragger
      v-decorator="decorators.file"
      :beforeUpload="beforeUpload"
      :fileList="fileList">
      <div class="pt-3 pb-3">
        <p class="ant-upload-drag-icon"><a-icon type="inbox" /></p>
        <p class="ant-upload-text">单击或拖动文件到该区域</p>
        <p class="ant-upload-hint">只能上传xlsx文件，且不超过2MB</p>
      </div>
    </a-upload-dragger>
  </a-form-item>
</template>

<script>
import { download } from '@/utils/utils'

export default {
  name: 'FileSelect',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    offsetWrapperCol: {
      type: Object,
      required: true,
    },
    downloadUrl: {
      type: String,
      required: true,
    },
  },
  inject: ['form'],
  data () {
    return {
      fileList: [],
    }
  },
  created () {
    this.$bus.$on('PhysicalmachineAddFileSelectClear', this.handleClearFile, this)
  },
  methods: {
    beforeUpload (file) {
      this.fileList = [file]
      return false
    },
    handleDownloadTemplate () {
      this.$http({
        method: 'GET',
        url: this.downloadUrl,
        responseType: 'blob',
      }).then(response => {
        download(response.data, 'host_template.xlsx')
      })
    },
    handleClearFile () {
      this.fileList = []
      this.form.fc.setFieldsValue({
        file: undefined,
      })
    },
  },
}
</script>
