<template>
  <a-form-item :label="$t('cloudenv.read_only')">
    <a-switch
      :checkedChildren="$t('cloudenv.text_84')"
      :unCheckedChildren="$t('cloudenv.text_85')"
      v-decorator="decorators.read_only" />
      <div slot="extra">
        {{ $t('cloudenv.read_only_extra') }}
      </div>
  </a-form-item>
</template>

<script>
export default {
  name: 'ReadOnly',
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
        read_only: [
          'read_only',
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
              read_only: val,
            })
          }
        })
      },
      immediate: true,
    },
  },
}
</script>
