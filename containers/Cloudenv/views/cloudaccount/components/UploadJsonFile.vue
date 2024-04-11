<template>
 <div>
   <a-form-item :label="$t('cloudenv.text_113')">
    <a-radio-group @change="handleTypeChange" v-model="type">
        <a-radio-button :value="1">{{$t('cloudenv.text_114')}}</a-radio-button>
        <a-radio-button :value="2">{{$t('cloudenv.text_115')}}</a-radio-button>
      </a-radio-group>
   </a-form-item>
   <a-form-item :label="$t('cloudenv.text_116')" v-if="type === 1" class="google-account-file">
    <a-upload-dragger
      v-bind="uploadDraggerConfig"
      :beforeUpload="handleBeforeUpload"
      :remove="hanldeRemoveFile"
      :fileList="fileList">
      <div style="padding: 10px;">
        <p class="ant-upload-drag-icon">
        <a-icon type="inbox" />
      </p>
        <p class="ant-upload-text">{{$t('cloudenv.text_117')}}</p>
        <p class="ant-upload-hint">{{$t('cloudenv.text_118')}}</p>
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
          rules: [{ required: true, message: this.$t('cloudenv.text_119') }],
        }],
      }
    },
    uploadDraggerConfig () {
      return {
        name: 'file',
        accept: '.json',
        headers: {
          Authorization: `Bearer ${this.$store.getters.userInfo.session}`,
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
      for (const key in json) {
        const k = ['project_id', 'private_key_id', 'private_key', 'client_email'].indexOf(key) > -1 ? `gcp_${key}` : key
        this.fc.getFieldDecorator(k, { preserve: true })
        this.fc.setFieldsValue({
          [k]: json[key],
        })
      }
    },
    handleBeforeUpload (file, fileList) {
      const isJson = file.name.endsWith('.json')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJson) {
        this.$message.error(this.$t('cloudenv.text_120'))
        return false
      }
      if (!isLt2M) {
        this.$message.error(this.$t('cloudenv.text_121'))
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
.google-account-file .ant-upload-drag-container {
  display: block !important;
}
.google-account-file .ant-form-item-label {
  visibility: hidden;
}
</style>
