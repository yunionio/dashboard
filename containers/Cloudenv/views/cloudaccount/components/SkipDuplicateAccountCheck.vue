<template>
  <a-form-item :label="$t('cloudenv.skip_duplicate_account_check')">
    <a-switch
      :checkedChildren="$t('cloudenv.text_84')"
      :unCheckedChildren="$t('cloudenv.text_85')"
      v-decorator="decorators.skip_duplicate_account_check" />
  </a-form-item>
</template>

<script>
export default {
  name: 'SkipDuplicateAccountCheck',
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
    },
  },
  data () {
    return {
      decorators: {
        skip_duplicate_account_check: [
          'skip_duplicate_account_check',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
      },
    }
  },
  watch: {
    checked: {
      handler: function (val) {
        this.$nextTick(() => {
          if (this.form) {
            this.form.fc.setFieldsValue({
              skip_duplicate_account_check: val,
            })
          }
        })
      },
      immediate: true,
    },
  },
}
</script>
