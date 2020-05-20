<template>
 <div>
   <a-form-item label="密钥匙录入方式">
    <a-radio-group @change="handleTypeChange" v-model="type">
        <a-radio-button :value="1">JSON文件导入</a-radio-button>
        <a-radio-button :value="2">手动表单录入</a-radio-button>
      </a-radio-group>
   </a-form-item>
   <a-form-item label="选择文件" v-if="type === 1" class="google-account-file">
    <a-upload-dragger
      v-bind="uploadDraggerConfig"
      :beforeUpload="handleBeforeUpload"
      :remove="hanldeRemoveFile"
      :fileList="fileList">
      <div style="padding: 10px;">
        <p class="ant-upload-drag-icon">
        <a-icon type="inbox" />
      </p>
        <p class="ant-upload-text">可将JSON文件拖拽到此处，或直接上传</p>
        <p class="ant-upload-hint">
          获取JSON文件路径：请登录 Google Cloud 控制台 - IAM 和管理（IAM & admin） - 服务账号（Service accounts） 获取 JSON 密钥文件
        </p>
      </div>
    </a-upload-dragger>
    <a-input v-show="false" v-decorator="decorators.file" type="text" />
  </a-form-item>
  <slot v-else />
 </div>
</template>

<script>
export default {
  name: 'ObjectsUploadFileDialog',
  props: {
    fc: {
      type: Object,
    },
  },
  data () {
    return {
      type: 1,
      fileList: [],
      loading: false,
    }
  },
  computed: {
    decorators () {
      return {
        file: ['file', {
          rules: [{ required: true, message: '请导入JSON文件' }],
        }],
      }
    },
    uploadDraggerConfig () {
      return {
        name: 'file',
        accept: '.json',
        headers: {
          'Authorization': `Bearer ${this.$store.getters.userInfo.session}`,
        },
      }
    },
  },
  watch: {
    fileList (value, oldValue) {
      this.fc.setFieldsValue({
        file: (value && value.length > 0) || undefined,
      }, () => {
        this.fc.validateFields(['file'])
      })
    },
  },
  created () {
    this.fileList = []
  },
  methods: {
    handleTypeChange () {
      this.fileList = []
    },
    setValues (jsonStr) {
      if (!jsonStr || jsonStr === '') return false
      const json = JSON.parse(jsonStr)
      for (let key in json) {
        const k = ['project_id', 'private_key_id', 'private_key', 'client_email'].indexOf(key) > -1 ? `gcp_${key}` : key
        this.fc.getFieldDecorator(k, {
          preserve: true,
          initialValue: json[key],
        })
      }
    },
    handleBeforeUpload (file, fileList) {
      const isJson = file.name.endsWith('.json')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJson) {
        this.$message.error('只能上传json文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('上传文件大小不超过2MB!')
        return false
      }
      file.text().then(jsonStr => {
        this.setValues(jsonStr)
      })
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.fileList = [file]
      return false
    },
    hanldeRemoveFile (file) {
      this.fileList = []
      return true
    },
  },
}
</script>
<style>
  .google-account-file .ant-upload-drag-container{
    display: block !important;
  }
  .google-account-file .ant-form-item-label{
    visibility: hidden
  }
</style>
