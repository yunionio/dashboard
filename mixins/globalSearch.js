export default {
  props: {
    responseData: {
      type: Object,
      validator: val => !val || val.data,
    },
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    showSearchbox: {
      type: Boolean,
      default: true,
    },
  },
}
