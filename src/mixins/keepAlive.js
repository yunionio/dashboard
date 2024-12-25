import * as R from 'ramda'

export default {
  created () {
    this.$bus.$on('destroyKeepAliveSidePage', () => {
      if (this.$refs?.list?.destroySidePages) {
        this.$refs.list.destroySidePages()
      }
    })
    this.$store.commit('keepAlive/clearDelayEvent')
  },
  activated () {
    this.emitKeepAliveDelayEvents(['ResourceListSingleRefresh'])
  },
  deactivated () {
    if (this.$refs?.list?.list?.clearWaitJob) {
      this.$refs.list.list.clearWaitJob()
    }
  },
  methods: {
    emitKeepAliveDelayEvents (eventList) {
      eventList.forEach(eventName => {
        const stateEventNames = this.$store.state.keepAlive.delayEvents
        if (Object.keys(stateEventNames).includes(eventName)) {
          if (eventName === 'ResourceListSingleRefresh') {
            const ids = R.is(Array, stateEventNames[eventName].params) ? stateEventNames[eventName].params : [stateEventNames[eventName].params]
            if (this.$refs.list && this.$refs.list.list) {
              ids.forEach(id => {
                this.$refs.list.list.singleRefreshWithoutParams(id, this.$refs.list.list.steadyStatus)
              })
            } else if (this.list) {
              ids.forEach(id => {
                this.list.singleRefreshWithoutParams(id, this.list.steadyStatus)
              })
            }
          } else {
            this.$bus.$emit(eventName, stateEventNames[eventName].params)
          }
          this.$store.commit('keepAlive/removeDelayEvent', eventName)
        }
      })
    },
  },
}
