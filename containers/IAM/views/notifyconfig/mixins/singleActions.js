export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('system.text_129'),
        permission: 'notifyconfigs_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('system.text_129'),
            name: this.$t('system.notify_channels'),
            onManager: this.onManager,
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}
