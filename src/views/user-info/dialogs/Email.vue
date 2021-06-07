<template>
  <a-form :form="form" v-bind="formItemLayout">
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
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'email',
  inject: ['userId', 'manager', 'dialogData', 'decorators', 'formItemLayout'],
  data () {
    return {
      codeButtonText: this.$t('scope.text_206'),
      codeButtonDisable: false,
      codeInt: null,
      email: this.dialogData.email,
      form: this.$form.createForm(this),
    }
  },
  destroyed () {
    clearInterval(this.codeInt)
  },
  methods: {
    async getEmailVerifyCode () {
      try {
        await this.manager.performAction({
          id: this.userId,
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
    async submit () {
      const values = await this.form.validateFields()
      await this.manager.performAction({
        id: this.userId,
        action: 'verify',
        data: {
          contact: this.email,
          contact_type: 'email',
          token: R.trim(values.code),
        },
      })
    },
  },
}
</script>
