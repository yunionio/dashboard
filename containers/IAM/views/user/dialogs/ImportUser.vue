<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('system.text_478')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-alert type="warning" class="mb-2">
          <template v-slot:message>
            <div class="messages-list">
              <p>{{ $t('system.text_501') }}<a-button type="link" @click="handleDownloadTemplate">{{$t('system.text_502')}}</a-button></p>
              <p>{{ $t('system.text_503') }}</p>
              <p>{{ $t('system.text_504') }}</p>
            </div>
          </template>
        </a-alert>
        <div class="pt-3 pb-3">
          <a-form-item>
            <a-upload-dragger
              v-decorator="decorators.fileList"
              :beforeUpload="beforeUpload"
              :fileList="fileList"
              :accept="accept"
              :remove="handleRemove">
              <div class="pt-3 pb-3">
                <p class="ant-upload-drag-icon"><a-icon type="inbox" /></p>
                <p class="ant-upload-text">{{$t('system.text_505')}}</p>
                <p class="ant-upload-hint">{{$t('system.text_506')}}</p>
              </div>
            </a-upload-dragger>
          </a-form-item>
        </div>
     </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { download } from '@/utils/utils'

export default {
  name: 'UserImprotDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      accept: '.xlsx',
      fileList: [],
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        fileList: ['fileList', {
          rules: [
            { required: true, message: this.$t('system.text_507') },
          ],
        }],
      },
    }
  },
  methods: {
    beforeUpload (file) {
      this.fileList = [file]
      return false
    },
    handleClearFile () {
      this.fileList = []
    },
    handleRemove () {
      this.handleClearFile()
    },
    handleDownloadTemplate () {
      this.$http({
        method: 'GET',
        url: '/v1/downloads/BatchUserRegister',
        responseType: 'blob',
      }).then(response => {
        download(response.data, 'user_template.xlsx')
      })
    },
    async handleConfirm () {
      try {
        if (!this.fileList || this.fileList.length === 0) {
          this.form.fc.setFieldsValue({
            fileList: undefined,
          })
        }
        this.loading = true
        await this.form.fc.validateFields()
        const formData = new FormData()
        formData.append('users', new Blob([this.fileList[0]], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
        formData.append('action', 'BatchUserRegister')
        await this.$http({
          url: '/v1/uploads/BatchUserRegister',
          method: 'post',
          processData: false,
          data: formData,
          timeout: 0,
        })
        this.params.refresh()
        this.cancelDialog()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
  .messages-list p{
    margin-bottom: 2px;
  }
</style>
