<template>
  <a-form :form="form" v-bind="formItemLayout">
    <a-form-item :label="$t('scope.text_200')">
      {{ imobile }}
    </a-form-item>
    <a-form-item :label="$t('scope.text_201')">
      <div class="d-flex">
        <a-input v-decorator="decorators.code" style="max-width: 100px;" />
        <a-button type="link" class="flex-grow-0 flex-shrink-0" @click="getMobileVerifyCode" :disabled="codeButtonDisable" style="width: 150px; border-left-width: 0;">{{ codeButtonText }}</a-button>
      </div>
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  name: 'mobile',
  inject: ['userId', 'manager', 'imobile', 'decorators', 'formItemLayout'],
  data () {
    return {
      processId: '',
      codeButtonText: this.$t('scope.text_206'),
      codeButtonDisable: false,
      codeInt: null,
      form: this.$form.createForm(this),
    }
  },
  destroyed () {
    this.vm = null
    clearInterval(this.codeInt)
  },
  methods: {
    async getMobileVerifyCode () {
      try {
        await this.manager.performAction({
          id: this.userId,
          action: 'trigger-verify',
          data: {
            contact: this.mobile,
            contact_type: 'mobile',
          },
        })
        let sec = 300
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
          contact_type: 'mobile',
          token: values.code,
        },
      })
    },
  },
}
</script>
