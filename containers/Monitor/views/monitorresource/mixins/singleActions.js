export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('monitor.monitorresources.management'),
        action: (obj) => {
          this.handleOpenSidepage(obj, 'CommonalertList')
        },
      },
    ]
  },
}
