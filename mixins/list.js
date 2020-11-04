export default {
  methods: {
    onManager () {
      return this.list.onManager(...arguments)
    },
    refresh () {
      return this.list.refresh(...arguments)
    },
    singleRefresh () {
      return this.list.singleRefresh(...arguments)
    },
  },
}
