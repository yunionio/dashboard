<template>
  <div>
    <a-form-item :label="$t('common_536')">
      <a-radio-group @change="handleTypeChange" v-model="type">
        <a-radio-button :value="1">{{$t('common_537')}}</a-radio-button>
        <a-radio-button :value="2">{{$t('cloudenv.text_115')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-bind="offsetWrapperCol"  v-if="type === 1">
      <a-upload-dragger
        v-bind="uploadDraggerConfig"
        :beforeUpload="handleBeforeUpload"
        :remove="hanldeRemoveFile"
        :fileList="fileList">
        <div style="padding: 10px;">
          <p class="ant-upload-drag-icon">
          <a-icon type="inbox" />
        </p>
          <p class="ant-upload-text">{{$t('common_538')}}</p>
        </div>
      </a-upload-dragger>
      <div v-show="false" v-decorator="decorators.file" />
    </a-form-item>
    <div v-if="type === 2">
      <a-form-item label="EntityID">
        <a-input v-decorator="decorators.entity_id" :placeholder="$t('common_539')" />
      </a-form-item>
      <a-form-item label="RedirectSSOURL">
        <a-input v-decorator="decorators.redirect_sso_url" :placeholder="$t('common_540')" />
      </a-form-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IdpEditSAML',
  props: {
    fc: {
      type: Object,
    },
    offsetWrapperCol: {
      type: Object,
      required: true,
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
        accept: '.xml',
        headers: {
          Authorization: `Bearer ${this.$store.getters.userInfo.session}`,
        },
      }
    },
    decorators () {
      const isFile = this.type === 1
      return {
        file: ['file', {
          rules: [{ required: isFile, message: this.$t('common_541') }],
        }],
        entity_id: ['entity_id', {
          rules: [{ required: !isFile, message: this.$t('common_539') }],
        }],
        redirect_sso_url: ['redirect_sso_url', {
          rules: [{ required: !isFile, message: this.$t('common_540') }],
        }],
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
    this.type = this.$route.params.id ? 2 : 1
  },
  methods: {
    handleTypeChange () {
    },
    setValues (xmlStr) {
      if (!xmlStr) return false
      const parser = new DOMParser()
      const xmldoc = parser.parseFromString(xmlStr, 'text/xml')
      const { entityID } = xmldoc.querySelector('EntityDescriptor').attributes
      let _entityID
      if (entityID) {
        _entityID = entityID.value || undefined
      }
      let _redirectSSOURL
      const singleSignOnServices = xmldoc.querySelectorAll('SingleSignOnService')
      if (singleSignOnServices && singleSignOnServices.length > 0) {
        let i = 0
        for (; i < singleSignOnServices.length; i++) {
          const { Binding, Location } = singleSignOnServices[i].attributes
          if (Binding && Binding.value) {
            const arr = Binding.value.split(':')
            if (arr.indexOf('HTTP-Redirect') > -1) {
              _redirectSSOURL = Location.value
              break
            }
          }
        }
      }
      if (_entityID && _redirectSSOURL) {
        this.fc.getFieldDecorator('entity_id', { preserve: true })
        this.fc.getFieldDecorator('redirect_sso_url', { preserve: true })
        this.fc.setFieldsValue({
          entity_id: _entityID,
          redirect_sso_url: _redirectSSOURL,
        })
        return true
      }
      this.$message.error(this.$t('common_542'))
      return false
    },
    handleBeforeUpload (file, fileList) {
      const isJson = file.name.endsWith('.xml')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJson) {
        this.$message.error(this.$t('common_543'))
        return false
      }
      if (!isLt2M) {
        this.$message.error(this.$t('cloudenv.text_121'))
        return false
      }
      file.text().then(xmlStr => {
        const f = this.setValues(xmlStr)
        if (!f) {
          this.fileList = []
        } else {
          this.fileList = [file]
        }
      })
      return false
    },
    hanldeRemoveFile (file) {
      this.fileList = []
      this.fc.setFieldsValue({
        file: undefined,
      }, () => {
        console.log(this.fc.getFieldValue('file'))
        this.fc.validateFields(['file'])
      })
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
