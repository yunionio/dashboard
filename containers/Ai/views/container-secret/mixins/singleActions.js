export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('table.action.modify'),
        action: obj => {
          this.createDialog('ContainerSecretUpdateDialog', {
            data: [obj],
            callback: () => {
              if (this.list) this.list.refresh()
              if (this.refresh) this.refresh()
            },
          })
        },
        meta: () => ({ validate: true }),
      },
      {
        label: this.$t('table.action.delete'),
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('table.action.delete'),
            name: this.$t('aice.container_secret'),
            onManager: this.onManager,
          })
        },
        meta: () => ({ validate: true }),
      },
    ]
  },
}
