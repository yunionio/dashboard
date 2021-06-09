<template>
  <a-form :form="form" v-bind="formItemLayout">
    <a-form-item :label="$t('scope.text_200')">
      {{ imobile }}
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  name: 'dingtalk',
  inject: ['userId', 'manager', 'imobile', 'formItemLayout'],
  data () {
    return {
      form: this.$form.createForm(this),
    }
  },
  methods: {
    async submit () {
      await this.manager.performAction({
        id: this.userId,
        action: 'trigger-verify',
        data: {
          contact_type: 'dingtalk',
        },
      })
    },
  },
}
</script>
