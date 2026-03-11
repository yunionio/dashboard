import * as R from 'ramda'

export default {
  props: ['params'],
  computed: {
    dialogData () {
      return this.$store.getters.dialogs[this.windowId]
    },
  },
  methods: {
    cancelDialog () {
      if (this.params && R.is(Function, this.params.cancel)) {
        this.params.cancel()
      }
      // DialogMixin 通常与 WindowsMixin 一起使用（提供 destroyDialog/windowId）。
      // 但也存在未注入 WindowsMixin 的弹窗场景，此时应允许弹窗正常关闭而不是抛错。
      if (R.is(Function, this.destroyDialog) && this.windowId) {
        this.destroyDialog(this.windowId)
        return
      }
      // 兜底：交由外层 dialog 容器处理关闭
      this.$emit && this.$emit('cancel')
    },
  },
}
