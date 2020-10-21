export default {
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    formItemLayout: {
      type: Object,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    type: String,
  },
  methods: {
    setDefaultName (usage) {
      const usageKey = this.type === 'k8s' ? 'k8s_usage' : 'usage'
      if (!this.form.fc.isFieldTouched(this.decorators.name[0])) {
        this.form.fc.setFieldsValue({
          [this.decorators.name[0]]: this.$t(usageKey)[usage],
        })
      }
    },
    cancel () {
      this.$emit('cancel')
    },
  },
}
