<template>
 <div>
   <a-form-item :label="$t('cloudenv.private_key')">
    <a-radio-group @change="handleTypeChange" v-model="type">
        <a-radio-button :value="1">{{ $t('cloudenv.private_key.upload_certificate') }}</a-radio-button>
        <a-radio-button :value="2">{{ $t('cloudenv.private_key.text_input') }}</a-radio-button>
      </a-radio-group>
   </a-form-item>
   <a-form-item :label="$t('cloudenv.text_116')" v-if="type === 1" class="pem-file-upload">
    <a-upload-dragger
      v-bind="uploadDraggerConfig"
      :beforeUpload="handleBeforeUpload"
      :remove="hanldeRemoveFile"
      :fileList="fileList">
      <div style="padding: 10px;">
        <p class="ant-upload-drag-icon">
        <a-icon type="inbox" />
      </p>
        <p class="ant-upload-text">{{ $t('common.drag_file_area') }}</p>
        <p class="ant-upload-hint">{{ $t('cloudenv.private_key.upload_pem_file') }}</p>
      </div>
    </a-upload-dragger>
    <a-input v-show="false" v-decorator="decorators.oracle_private_pem" type="text" />
  </a-form-item>
  <a-form-item :label="$t('cloudenv.text_116')" v-else class="pem-file-upload">
    <slot />
  </a-form-item>
 </div>
</template>

<script>
export default {
  name: 'ObjectsUploadPemFileDialog',
  props: {
    decorators: {
      type: Object,
    },
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
    uploadDraggerConfig () {
      return {
        name: 'file',
        accept: '.pem',
        headers: {
          Authorization: `Bearer ${this.$store.getters.userInfo.session}`,
        },
      }
    },
  },
  created () {
    this.fileList = []
  },
  methods: {
    handleTypeChange () {
      this.fileList = []
    },
    setValues (val) {
      if (!val || val === '') return false
      this.fc.setFieldsValue({ oracle_private_pem: val })
    },
    handleBeforeUpload (file) {
      const isPem = file.name.endsWith('.pem')
      const isLimit2M = file.size / 1024 / 1024 < 2
      if (!isPem) {
        this.$message.error(this.$t('cloudenv.private_key.upload_pem_file'))
        return false
      }
      if (!isLimit2M) {
        this.$message.error(this.$t('cloudenv.text_121'))
        return false
      }
      file.text().then(val => {
        this.setValues(val)
      })
      this.fileList = [file]
      return false
    },
    hanldeRemoveFile () {
      this.fileList = []
      this.fc.setFieldsValue({ oracle_private_pem: '' })
      return true
    },
  },
}
</script>
<style>
.pem-file-upload .ant-upload-drag-container {
  display: block !important;
}
.pem-file-upload .ant-form-item-label {
  visibility: hidden;
}
</style>
