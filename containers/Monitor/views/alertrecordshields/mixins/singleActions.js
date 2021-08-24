export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('monitor.alerts.shield.dismiss'),
        permission: 'monitorresourcealerts_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('monitor.alerts.shield.dismiss'),
            name: this.$t('dictionary.monitorresourcealerts'),
            onManager: this.onManager,
            success: () => {
              if (this.params && this.params.options && this.params.options.sourceList) {
                this.params.options.sourceList.refresh()
              }
            },
          })
        },
      },
    ]
  },
}
