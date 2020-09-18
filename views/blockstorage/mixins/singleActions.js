import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import { STORAGE_TYPES } from '@Storage/constants/index.js'

export default {
  created () {
    this.singleActions = [
      {
        label: '修改属性',
        permission: 'storages_update',
        action: row => {
          this.createDialog('BlockStorageUpdateStorageDialog', {
            data: [row],
            columns: this.columns,
            title: '修改属性',
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
      {
        label: '更多',
        actions: (row) => {
          return [
            ...getEnabledSwitchActions(this),
            {
              label: '关联宿主机',
              permission: 'storages_perform_storages',
              action: row => {
                this.createDialog('AssociatedHostDialog', {
                  data: [row],
                  columns: this.columns,
                  title: '关联宿主机',
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: row => {
                const validate = ['rbd', 'nfs', 'gpfs'].includes(row.storage_type)
                return {
                  validate,
                  tooltip: !validate && `${STORAGE_TYPES[row.storage_type] || row.storage_type}类型不支持该操作`,
                }
              },
            },
            {
              label: '调整超售比',
              permission: 'storages_update',
              action: row => {
                this.createDialog('BlockStorageUpdateCommitBoundDialog', {
                  data: [row],
                  columns: this.columns,
                  title: '调整超售比',
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: row => {
                return {
                  validate: row.provider !== 'ZStack',
                  tooltip: row.provider === 'ZStack' && '该平台暂不支持此操作',
                }
              },
            },
            {
              label: '调整容量',
              permission: 'storages_update_capacity',
              action: row => {
                this.createDialog('BlockStorageUpdateCapacityDialog', {
                  data: [row],
                  columns: this.columns,
                  title: '调整容量',
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
              label: '调度标签',
              action: row => {
                this.createDialog('BlockStorageUpdateTagsDialog', {
                  data: [row],
                  columns: this.columns,
                  title: '调度标签',
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
                  ret.tooltip = '本地存储不支持该操作，默认与该宿主机一致'
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
                  ret.tooltip = '本地存储不支持该操作，默认与该宿主机一致'
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
              label: '删除',
              permission: 'storages_delete',
              action: row => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: '删除',
                  name: '块存储',
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
