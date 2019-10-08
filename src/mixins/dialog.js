import * as R from 'ramda'

export default {
  computed: {
    dialogData () {
      return this.$store.getters.dialogs[this.windowId]
    },
    params () {
      return this.dialogData.params
    },
  },
  methods: {
    cancelDialog () {
      if (this.params && R.is(Function, this.params.cancel)) {
        this.params.cancel()
      }
      this.destroyDialog(this.windowId)
    },
  },
}
