export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('k8s.repo.credential.update'),
        permission: 'container_registries_perform_update_credential',
        action: obj => {
          this.createDialog('ReposUpdateCredentialDialog', {
            data: [obj],
            refresh: () => {
              if (this.list) this.list.refresh()
              if (this.refresh) this.refresh()
            },
          })
        },
      },
      {
        label: this.$t('table.action.delete'),
        permission: 'container_registries_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('table.action.delete'),
            name: this.$t('dictionary.container_registry'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
