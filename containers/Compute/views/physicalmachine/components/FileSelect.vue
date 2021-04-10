<template>
  <a-form-item :wrapper-col="offsetWrapperCol">
    <a-alert type="warning" class="mb-2">
      <template v-slot:message>
        <div>{{$t('compute.text_814')}}</div>
        <div>{{$t('compute.text_815')}}<a-button type="link" @click="handleDownloadTemplate">{{$t('compute.text_816')}}</a-button></div>
        <div>{{$t('compute.text_817')}}</div>
      </template>
    </a-alert>
    <a-upload-dragger
      v-decorator="decorators.file"
      :beforeUpload="beforeUpload"
      :fileList="fileList"
      :remove="handleRemove">
      <div class="pt-3 pb-3">
        <p class="ant-upload-drag-icon"><a-icon type="inbox" /></p>
        <p class="ant-upload-text">{{$t('compute.text_818')}}</p>
        <p class="ant-upload-hint">{{$t('compute.text_819')}}</p>
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
    handleRemove () {
      this.handleClearFile()
    },
  },
}
</script>
