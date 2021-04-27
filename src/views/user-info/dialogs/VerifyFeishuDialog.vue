<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('common_627', [$t('common.feishu')]) }}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('scope.text_200')">
          {{ imobile }}
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VerifyFeishuDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      international_mobile: this.params.data.international_mobile,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        code: [
          'code',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('scope.text_209') },
              {
                pattern: '[0-9]{6}',
                message: this.$t('scope.text_210'),
              },
            ],
          },
        ],
      },
      formItemLayout: {
        labelCol: {
          sm: { span: 3 },
        },
        wrapperCol: {
          sm: { span: 21 },
        },
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    imobile () {
      if (this.international_mobile.area_code) {
        return `+${this.international_mobile.area_code} ${this.international_mobile.mobile}`
      } else {
        return this.international_mobile.mobile
      }
    },
  },
  created () {
    this.manager = new this.$Manager('receivers', 'v1')
  },
  destroyed () {
    this.manager = null
  },
  methods: {
    handleConfirm () {
      this.doSubmit()
    },
    async doSubmit () {
      this.loading = true
      try {
        await this.manager.performAction({
          id: this.userInfo.id,
          action: 'trigger-verify',
          data: {
            contact: this.mobile,
            contact_type: 'feishu',
          },
        })
        this.params.success && this.params.success()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
