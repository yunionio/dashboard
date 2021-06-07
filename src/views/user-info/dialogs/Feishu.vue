<template>
    <a-form :form="form" v-bind="formItemLayout">
      <a-form-item :label="$t('scope.text_200')">
        {{ imobile }}
      </a-form-item>
    </a-form>
</template>

<script>
export default {
  name: 'feishu',
  inject: ['userId', 'manager', 'imobile', 'decorators', 'formItemLayout'],
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
          contact_type: 'feishu',
        },
      })
    },
  },
}
</script>
