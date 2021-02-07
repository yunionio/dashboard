<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('scope.text_202') }}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('scope.text_204')" :help="$t('scope.text_205')">
          {{ email }}
        </a-form-item>
        <a-form-item :label="$t('scope.text_201')">
          <div class="d-flex">
            <a-input v-decorator="decorators.code" style="max-width: 100px;" />
            <a-button type="link" class="flex-grow-0 flex-shrink-0" @click="getEmailVerifyCode" :disabled="codeButtonDisable" style="width: 150px; border-left-width: 0;">{{ codeButtonText }}</a-button>
          </div>
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
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VerifyEmailDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      codeButtonText: this.$t('scope.text_206'),
      codeButtonDisable: false,
      codeInt: null,
      email: this.params.data.email,
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
  },
  created () {
    this.manager = new this.$Manager('receivers', 'v1')
  },
  destroyed () {
    this.manager = null
    clearInterval(this.codeInt)
  },
  methods: {
    handleConfirm () {
      this.doSubmit()
    },
    async getEmailVerifyCode () {
      try {
        await this.manager.performAction({
          id: this.userInfo.id,
          action: 'trigger-verify',
          data: {
            contact: this.email,
            contact_type: 'email',
          },
        })
        let sec = 120
        this.codeButtonDisable = true
        this.codeButtonText = this.$t('scope.text_219', [sec])

        this.codeInt = setInterval(() => {
          sec -= 1
          const text = this.$t('scope.text_219', [sec])
          this.codeButtonText = text
          if (sec <= 0) {
            this.codeButtonDisable = false
            this.codeButtonText = this.$t('scope.text_206')
            clearInterval(this.codeInt)
          }
        }, 1000)
      } catch (error) {
        throw error
      }
    },
    async doSubmit () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.manager.performAction({
          id: this.userInfo.id,
          action: 'verify',
          data: {
            contact: this.email,
            contact_type: 'email',
            token: R.trim(values.code),
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
