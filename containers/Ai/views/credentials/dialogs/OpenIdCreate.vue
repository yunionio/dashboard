<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body" v-loading="loading">
     <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('common_633')">
          <a-input :placeholder="$t('common_634')" v-decorator="decorators.redirect_uri" />
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
  name: 'CredentialOpendIdCreate',
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
        redirect_uri: [
          'redirect_uri',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('common_634') },
              { validator: this.$validate('url') },
            ],
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
          action: 'create-oidc-secret',
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
