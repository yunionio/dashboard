// import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('table.action.delete'),
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('table.action.delete'),
            name: this.$t('compute.pci.pass_through_device_type'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
