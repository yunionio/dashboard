export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.delete'),
        permission: 'saml_providers_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('table.action.delete'),
            name: this.$t('cloudenv.saml_provider'),
            onManager: this.onManager,
          })
        },
      },
    ]
  },
}
