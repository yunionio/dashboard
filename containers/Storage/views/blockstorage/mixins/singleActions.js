import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import { getDisabledProvidersActionMeta } from '@/utils/common/hypervisor'
import i18n from '@/locales'

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
        extraMeta: obj => {
          return getDisabledProvidersActionMeta({
            row: obj,
            disabledProviders: ['BingoCloud'],
          })
        },
      },
      {
        label: i18n.t('storage.text_65'),
        actions: (row) => {
          return [
            ...getEnabledSwitchActions(this, undefined, ['storages_perform_enable', 'storages_perform_disable'], {
              extraMetas: [
                obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
                obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              ],
            }),
            {
              label: i18n.t('storage.host.manage'),
              action: row => {
                if (this.handleOpenSidepage) {
                  this.handleOpenSidepage(row, 'host-list')
                } else {
                  this.$refs.BaseSidePage.handleTabChange('host-list')
                }
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud'],
                })
              },
            },
            {
              label: i18n.t('storage.text_34'),
              permission: 'storages_perform_set_commit_bound',
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
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud'],
                })
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
                  validate: row.provider === 'OpenStack' || row.provider === 'HCS',
                }
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud'],
                })
              },
            },
            {
              label: i18n.t('compute.text_540'),
              permission: 'storages_update',
              action: row => {
                this.createDialog('BlockStorageUpdateTagsDialog', {
                  data: [row],
                  columns: this.columns,
                  title: i18n.t('compute.text_540'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud'],
                })
              },
            },
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.storages'),
              resource: 'storages',
            }, {
              permission: 'storages_perform_change_owner',
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
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud'],
                })
              },
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.storages'),
              scope: 'domain',
              resource: 'storages',
            }, {
              permission: 'storages_perform_public',
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
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud'],
                })
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
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud'],
                })
              },
            },
          ]
        },
      },
    ]
  },
}
