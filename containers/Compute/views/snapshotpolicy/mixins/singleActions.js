import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('table.action.modify'),
        permission: 'snapshotpolicy_update',
        action: obj => {
          this.createDialog('CreateSnapshotPolicyDialog', {
            type: 'update',
            data: [obj],
            onManager: this.onManager,
            columns: this.columns,
          })
        },
      },
      {
        label: i18n.t('compute.bind_resource'),
        permission: 'disks_perform_bind_snapshotpolicy,servers_perform_bind_snapshotpolicy,snapshotpolicy_perform_bind_resources,snapshotpolicy_perform_unbind_resources',
        action: obj => {
          this.createDialog('AttachResourceDialog', {
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.bind_resource'),
            refresh: this.refresh,
          })
        },
        meta: obj => {
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('compute.perform_delete'),
        permission: 'snapshotpolicy_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.perform_delete'),
            name: this.$t('dictionary.snapshotpolicy'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
