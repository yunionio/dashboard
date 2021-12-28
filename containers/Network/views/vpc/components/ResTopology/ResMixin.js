export default {
  methods: {
    getPopupContainer (popover) {
      return document.querySelector('.res-topology')
    },
    isEmpty (arr) {
      return !arr || arr.length === 0
    },
  },
}
