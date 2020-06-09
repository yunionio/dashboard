<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="证书名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholder="字母开头，数字和字母大小写组合，长度为2-128个字符，不含'.','_','@'" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">证书内容
            <a-tooltip>
              <div slot="title">
                1.以-----BEGIN CERTIFICATE-----开头,以-----END CERTIFICATE-----结尾；<br />2.每行64个字符，最后一行长度可以不足64个字符；<br />3.证书内容不能包含空格。
              </div>
              <a-icon type="info-circle" />
            </a-tooltip>
          </span>
          <a-textarea
            v-decorator="decorators.certificate"
            placeholder="请输入证书内容"
            rows="4" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">证书密钥
            <a-tooltip>
              <div slot="title">
                1.以-----BEGIN RSA PRIVATE KEY-----开头,以-----END RSA PRIVATE KEY-----结尾；<br />2.每行64个字符，最后一行长度可以不足64个字符；<br />3.证书内容不能包含空格。
              </div>
              <a-icon type="info-circle" />
            </a-tooltip>
          </span>
          <a-textarea
            v-decorator="decorators.private_key"
            placeholder="请输入证书密钥"
            rows="4" />
        </a-form-item>
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

export default {
  name: 'LbcertsCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('certName') },
            ],
          },
        ],
        certificate: [
          'certificate',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: '证书内容不能为空' },
            ],
          },
        ],
        private_key: [
          'private_key',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: '证书密钥不能为空' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  methods: {
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
