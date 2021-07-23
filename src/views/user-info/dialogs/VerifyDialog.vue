<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ header }}</div>
    <div slot="body">
      <component :is="contactType" ref="form" />
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
import dingtalk from './Dingtalk'
import email from './Email'
import feishu from './Feishu'
import mobile from './Mobile'
import workwx from './Workwx'

export default {
  name: 'VerifyUserInfoDialog',
  components: {
    dingtalk,
    email,
    feishu,
    mobile,
    workwx,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    userId () {
      return this.userInfo.id
    },
    imobile () {
      const m = this.params.data.international_mobile
      if (m.area_code) {
        return `+${m.area_code} ${m.mobile}`
      } else {
        return m.mobile
      }
    },
    contactType () {
      // dingtalk, email, feishu, mobile, workwx
      return this.params.contactType
    },
    header () {
      return {
        dingtalk: this.$t('common_627', [this.$t('common.dingtalk')]),
        email: this.$t('scope.text_202'),
        feishu: this.$t('common_627', [this.$t('common.feishu')]),
        mobile: this.$t('scope.text_199'),
        workwx: this.$t('common_627', [this.$t('system.wecom.1')]),
      }[this.contactType]
    },
  },
  provide: function () {
    return {
      userId: this.userId,
      dialogData: this.params.data,
      imobile: this.imobile,
      manager: new this.$Manager('receivers', 'v1'),
      formItemLayout: {
        labelCol: {
          sm: { span: 3 },
        },
        wrapperCol: {
          sm: { span: 21 },
        },
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
    }
  },
  methods: {
    handleConfirm () {
      this.doSubmit()
    },
    async doSubmit () {
      this.loading = true
      try {
        await this.$refs.form.submit()
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
