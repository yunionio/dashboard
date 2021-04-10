export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('cloudenv.text_463'),
        action: (obj) => {
          this.createDialog('ViewAlertrecordDetailDialog', {
            vm: this,
            data: [obj],
          })
        },
      },
    ]
  },
}
