export default {
  props: {
    showSearchbox: {
      type: Boolean,
      default: true,
    },
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    responseData: { // release 详情中用 responseData 渲染
      type: Object,
      validator: val => val.data,
    },
    getResponseData: {
      type: Function,
    },
  },
  watch: {
    responseData (val) {
      this.list.responseData = val
      this.list.refresh()
    },
  },
}
