<template>
  <a-form-item :label="$t('compute.text_244')">
    <a-upload
      name="files"
      :fileList="fileList"
      :multiple="true"
      :remove="handleRemove"
      :beforeUpload="beforeUpload">
      <a-button> <a-icon type="upload" />{{$t('compute.text_245')}}</a-button>
    </a-upload>
    <span slot="extra" :class="err ? 'error-color' : 'text-color-help'">{{$t('compute.text_246')}}</span>
  </a-form-item>
</template>
<script>

export default {
  name: 'AnsibleTemplateUpload',
  inject: ['form'],
  props: ['defaultFiles'],
  data () {
    return {
      fileList: [],
      files: {},
      err: false,
    }
  },
  watch: {
    files (newFiles) {
      this.form.setFieldsValue({
        files: newFiles,
      })
    },
    fileList (newFileList) {
      this.setFiles(newFileList)
    },
    defaultFiles (fileBuffers) {
      if (fileBuffers) {
        Object.keys(fileBuffers).forEach((key, index) => {
          const buffer = new Uint8Array(fileBuffers[key]).buffer
          const blob = new Blob([buffer])
          const file = new File([blob], key)
          // file['name'] = key
          file.uid = index
          // const elink = document.createElement('a')
          // elink.download = key
          // elink.style.display = 'none'
          // elink.target = '_blankv'
          // elink.href = URL.createObjectURL(blob)
          // document.body.appendChild(elink)
          // elink.click()
          // document.body.removeChild(elink)
          // console.log(file)
          this.fileList.push(file)
        })
      }
    },
  },
  created () {
    this.form.getFieldDecorator('files', { preserve: true, initialValue: {} })
  },
  methods: {
    validateSize (filelist) {
      if (!filelist || filelist.length === 0) {
        return true
      }
      const MAX_KB = 64
      const filesSize = filelist.length === 1 ? filelist[0].size : filelist.reduce((x, y) => {
        return x.size + y.size
      })
      if (Math.ceil(parseFloat(filesSize) / 1024) > MAX_KB) {
        return false
      }
      return true
    },
    beforeUpload (file, filelist) {
      this.err = !this.validateSize(filelist.concat(this.fileList))
      this.fileList.push(file)
      return false
    },
    handleRemove (file) {
      this.fileList = this.fileList.filter(item => {
        return file.uid !== item.uid
      })
      this.err = !this.validateSize(this.fileList)
      return true
    },
    setFiles (filelist = this.filelist) {
      this.files = {}
      filelist.forEach(async file => {
        const { name } = file
        const buffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)
        this.files[name] = Object.values(uint8Array)
      })
    },
  },
}
</script>
