export default {
  methods: {
    onManager () {
      return this.list.onManager(...arguments)
    },
    refresh () {
      return this.list.refresh(...arguments)
    },
  },
}
