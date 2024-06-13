<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('common_269') }}</div>
    <div slot="body">
      <a-alert class="mb-2" :message="$t('iam.sms_mobile')" />
      <a-form-model
        ref="form"
        v-bind="formItemLayout"
        :model="form"
        :rules="rules">
        <a-form-model-item :label="$t('iam.mobile')" prop="phone_number">
          <a-input v-model="form.phone_number" />
        </a-form-model-item>
      </a-form-model>
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
import { validateModelForm } from '@/utils/validate'

export default {
  name: 'NotifyTestMobileDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        phone_number: '',
      },
      rules: {
        phone_number: [
          { validator: this.$validate('mobile') },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  created () {
    this.manager = new this.$Manager('notifyconfigs', 'v1')
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await validateModelForm(this.$refs.form)
        this.loading = true
        const res = await this.manager.performClassAction({
          action: 'validate',
          data: {
            content: {
              ...this.params.data.content,
              phone_number: this.form.phone_number,
            },
            type: this.params.data.type,
          },
        })
        const { is_valid, message } = res.data
        if (is_valid) {
          this.$notification.success({
            message: this.$t('common_270'),
            description: this.$t('common_271'),
          })
        } else {
          this.$notification.error({
            message: message,
          })
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
