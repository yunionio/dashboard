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
  },
}
