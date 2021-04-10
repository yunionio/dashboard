export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('cloudenv.text_463'),
        action: (obj) => {
          this.createDialog('ViewItemTagsDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('monitor.text_104'),
          })
        },
      },
    ]
  },
}
