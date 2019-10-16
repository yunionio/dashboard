import * as R from 'ramda'

export default {
  props: ['params'],
  computed: {
    sidePageData () {
      return this.$store.getters.sidePages[this.windowId]
    },
  },
  methods: {
    cancelSidePage () {
      if (this.params && R.is(Function, this.params.cancel)) {
        this.params.cancel()
      }
      this.destroySidePage(this.windowId)
    },
  },
}
