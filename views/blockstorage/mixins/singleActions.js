import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { STORAGE_TYPES } from '@Storage/constants/index.js'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('storage.text_64'),
        permission: 'storages_update',
        action: row => {
          this.createDialog('BlockStorageUpdateStorageDialog', {
            data: [row],
            columns: this.columns,
            title: i18n.t('storage.text_64'),
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
      {
        label: i18n.t('storage.text_65'),
        actions: (row) => {
          return [
            ...getEnabledSwitchActions(this),
            {
              label: i18n.t('storage.text_66'),
              permission: 'storages_perform_storages',
              action: row => {
                this.createDialog('AssociatedHostDialog', {
                  data: [row],
                  columns: this.columns,
                  title: i18n.t('storage.text_66'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: row => {
                const validate = ['rbd', 'nfs', 'gpfs'].includes(row.storage_type)
                return {
                  validate,
                  tooltip: !validate && i18n.t('storage.text_67', [STORAGE_TYPES[row.storage_type] || row.storage_type]),
                }
              },
            },
            {
              label: i18n.t('storage.text_34'),
              permission: 'storages_update',
              action: row => {
                this.createDialog('BlockStorageUpdateCommitBoundDialog', {
                  data: [row],
                  columns: this.columns,
                  title: i18n.t('storage.text_34'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: row => {
                return {
                  validate: row.provider !== 'ZStack',
                  tooltip: row.provider === 'ZStack' && i18n.t('storage.text_68'),
                }
              },
            },
            {
              label: i18n.t('storage.text_69'),
              permission: 'storages_update_capacity',
              action: row => {
                this.createDialog('BlockStorageUpdateCapacityDialog', {
                  data: [row],
                  columns: this.columns,
                  title: i18n.t('storage.text_69'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: row => {
                return {
                  validate: row.provider === 'OpenStack',
                }
              },
            },
            {
              label: i18n.t('compute.text_540'),
              action: row => {
                this.createDialog('BlockStorageUpdateTagsDialog', {
                  data: [row],
                  columns: this.columns,
                  title: i18n.t('compute.text_540'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
            },
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.storages'),
              resource: 'storages',
            }, {
              meta: (row) => {
                const isLocal = row.storage_type === 'local'
                const ret = {
                  validate: true,
                  tooltip: null,
                }
                if (isLocal) {
                  ret.validate = false
                  ret.tooltip = i18n.t('storage.text_70')
                }
                return ret
              },
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.storages'),
              scope: 'domain',
              resource: 'storages',
            }, {
              meta: (row) => {
                const isLocal = row.storage_type === 'local'
                const ret = {
                  validate: true,
                  tooltip: null,
                }
                if (isLocal) {
                  ret.validate = false
                  ret.tooltip = i18n.t('storage.text_70')
                }
                return ret
              },
            }),
            // {
            //   label: '同步状态',
            //   action: obj => {
            //     this.onManager('performAction', {
            //       steadyStatus: ['running', 'ready'],
            //       id: obj.id,
            //       managerArgs: {
            //         action: 'syncstatus',
            //       },
            //     })
            //   },
            //   meta: () => ({
            //     validate: true,
            //   }),
            // },
            {
              label: i18n.t('storage.text_36'),
              permission: 'storages_delete',
              action: row => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('storage.text_36'),
                  name: i18n.t('storage.text_37'),
                  data: [row],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: (row) => this.$getDeleteResult(row),
            },
          ]
        },
      },
    ]
  },
}
