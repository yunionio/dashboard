export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('table.action.modify'),
        permission: 'isolated_device_models_update',
        action: obj => {
          this.createDialog('UpdateHotPluggableDialog', {
            data: [obj],
            refresh: this.refresh,
          })
        },
      },
      {
        label: this.$t('table.action.delete'),
        permission: 'isolated_device_models_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('table.action.delete'),
            name: this.$t('compute.pci.passthrough_device_type'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
