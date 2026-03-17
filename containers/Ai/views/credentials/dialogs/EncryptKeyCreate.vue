<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body" v-loading="loading">
     <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('scope.encrypt_key.title.name')">
          <a-input :placeholder="$t('scope.encrypt_key.title.name')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('scope.encrypt_key.title.alg')">
          <a-radio-group v-decorator="decorators.alg">
            <a-radio-button value="">{{ $t('compute.text_1') }}</a-radio-button>
            <a-radio-button value="aes-256">AES-256</a-radio-button>
            <a-radio-button value="sm4">SM4</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>
<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CredentialEncryptKeyCreate',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('scope.encrypt_key.require_name.prompt') },
            ],
          },
        ],
        alg: [
          'alg',
          {
            initialValue: '',
          },
        ],
      },
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('rpc/credentials', 'v1')
  },
  methods: {
    async handleConfirm () {
      try {
        const values = await this.form.fc.validateFields()
        await this.manager.performClassAction({
          action: 'create-encrypt-key',
          data: values,
        })
        this.params.refresh()
        this.cancelDialog()
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
