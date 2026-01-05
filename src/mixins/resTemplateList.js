export default {
  props: {
    isTemplate: {
      type: Boolean,
      default: false,
    },
    isTemplateEdit: {
      type: Boolean,
      default: false,
    },
    templateParams: {
      type: Object,
      default: () => ({}),
    },
    templateListColumns: {
      type: Array,
    },
    templateLimit: {
      type: Number,
      default: 10,
    },
  },
  watch: {
    templateLimit: {
      handler (newVal) {
        this.list.templateLimit = newVal
        this.list.fetchData()
      },
    },
  },
}
