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
      this.destroyDialog(this.windowId)
    },
  },
}
