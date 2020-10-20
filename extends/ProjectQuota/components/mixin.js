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
    type: {
      type: String,
      required: true,
    },
  },
}
