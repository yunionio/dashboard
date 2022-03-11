import {
  getSetPublicAction,
} from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('compute.perform_sync_status'),
        permission: 'backupstorages_perform_syncstatus',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: () => ({
          validate: true,
        }),
      },
      {
        label: this.$t('compute.text_352'),
        actions: obj => {
          return [
            getSetPublicAction(this, {
              name: this.$t('dictionary.backup_storage'),
              scope: 'domain',
              resource: 'backupstorages',
            }, {
              permission: 'backupstorages_perform_public',
            }),
            {
              label: this.$t('compute.perform_delete'),
              permission: 'backupstorages_delete',
              action: obj => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('compute.perform_delete'),
                  onManager: this.onManager,
                  name: this.$t('compute.backup_storage'),
                })
              },
              meta: obj => {
                return this.$getDeleteResult(obj)
              },
            },
          ]
        },
      },
    ]
  },
}
