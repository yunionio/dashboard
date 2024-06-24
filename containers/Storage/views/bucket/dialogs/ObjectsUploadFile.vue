<template>
  <base-dialog @cancel="handleCancel" :modalProps="{footer: null}">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('storage.text_117')">
          {{uploadTo}}
        </a-form-item>
        <a-form-item :label="$t('storage.text_118')" class="upload-file-item pb-3">
          <a-upload-dragger
            v-decorator="decorators.files"
            @change="hanldeFileChange"
            v-bind="uploadDraggerConfig">
            <div style="padding: 10px; min-width: 600px">
              <p class="ant-upload-drag-icon">
              <a-icon type="inbox" />
            </p>
             <p class="ant-upload-text">{{$t('storage.text_119')}}<a>{{$t('storage.text_120')}}</a></p>
            </div>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
      <div style="text-align: center;margin-top:10px;font-size: 12px;" v-if="statusNums">
        <span>{{$t('storage.text_121', [statusNums.uploading])}}</span>
        <a-divider type="vertical" />
        <span>{{$t('storage.text_122', [statusNums.done])}}</span>
        <a-divider type="vertical" />
        <span>{{$t('storage.text_123', [statusNums.error])}}</span>
      </div>
    </div>
  </base-dialog>
</template>

<script>
import { formItemLayout } from '@Storage/constants/index.js'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ObjectsUploadFileDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout,
      fileList: [],
      statusNums: undefined,
      modalProps: {
        footer: null,
      },
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        files: ['files', {
          rules: [
            { required: true, message: this.$t('storage.text_124') },
          ],
        }],
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    uploadTo () {
      const { resItem, prefix } = this.params
      return `${resItem.name}/${prefix}`
    },
    uploadConfig () {
      return {
        timeout: 0,
        url: '/v1/s3uploads',
        method: 'post',
        processData: false,
      }
    },
    uploadDraggerConfig () {
      const { resId, prefix } = this.params
      return {
        name: 'file',
        action: '/api/v1/s3uploads',
        multiple: true,
        data: (file) => {
          const { name, size } = file
          return {
            bucket_id: resId,
            fileName: name,
            key: `${prefix}${name}`,
            content_length: size,
            acl: 'private',
          }
        },
        headers: {
          Authorization: `Bearer ${this.$store.getters.auth.auth.session}`,
        },
      }
    },
  },
  methods: {
    async fetchRemoveFile (key) {
      try {
        const { resId } = this.params
        const manager = new this.$Manager('buckets', 'v2')
        await manager.performAction({
          id: resId,
          action: 'delete',
          data: {
            keys: [key],
          },
        })
      } catch (err) {
        throw err
      }
    },
    hanldeFileChange ({ fileList }) {
      // if (!fileList || !fileList.length) return false
      const _statusNums = {
        uploading: 0,
        error: 0,
        done: 0,
      }
      if (fileList && Array.isArray(fileList)) {
        fileList.forEach((file) => {
          const { status, response } = file
          if (status === 'error' && response) {
            file.response = response.details
          }
          _statusNums[status] += 1
        })
      }
      this.statusNums = _statusNums
    },
    handleCancel () {
      if (document.getElementsByClassName('ant-upload-list-item-uploading').length) {
        this.createDialog('ConfirmDialog', {
          title: this.$t('storage.text_125'),
          width: '550px',
          content: this.$t('storage.text_126'),
          onOk: () => {
            this.cancelDialog()
            this.params.list.fetchData()
          },
        })
      } else {
        this.cancelDialog()
        this.params.list.fetchData()
      }
    },
  },
}
</script>
<style lang="less">
  .upload-file-item .ant-upload-list-item-done .anticon-close {
    display: none;
  }
  .upload-file-item .ant-upload-list-item-done .ant-upload-list-item-card-actions {
    display: none;
  }
  .upload-file-item .ant-upload-list-item  .anticon-close {
    opacity: 1;
    color: rgba(0, 0, 0, 0.7);
    z-index: 0;
  }
  :root .ant-upload-list-item .anticon-close {
    font-size: 14px;
  }
  .upload-file-item .ant-upload-list {
    height: 200px;
    overflow: auto;
    padding-right: 20px;
  }
</style>
