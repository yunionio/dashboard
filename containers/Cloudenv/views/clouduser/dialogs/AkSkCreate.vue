<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.aksk.add') }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('cloudenv.text_327')">
          <a-textarea
            v-decorator="decorators.name"
            :placeholder="$t('cloudenv.aksk.placeholder')"
            :auto-size="{ minRows: 3, maxRows: 5 }" />
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
  name: 'AkSkCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      userLoading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: false, message: this.$t('common_367') },
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
    async handleConfirm () {
      this.loading = true
      try {
        const manager = new this.$Manager('cloudusers')
        const values = await this.form.fc.validateFields()
        await manager.performAction({
          id: this.params.cloudaccountId,
          action: 'create-access-key',
          data: {
            id: this.params.cloudaccountId,
            name: values.name,
          },
        })
        this.cancelDialog()
        this.params.callback()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
