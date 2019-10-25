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
      this.handleTabChange(this.params.windowData._currentTab)
      this.destroySidePage(this.windowId)
    },
    handleTabChange (val) {
      this._updateWindow({
        id: this.sidePageData.parentWindowId,
        currentTab: val,
      })
    },
  },
}
