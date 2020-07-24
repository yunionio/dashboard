import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: '同步状态',
        permission: 'server_perform_syncstatus',
        action: (row) => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: row.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: row => {
          return {
            validate: row.status !== 'sync_status',
          }
        },
      },
      {
        label: '更多',
        actions: row => {
          return [
            {
              label: '设置上限',
              permission: 'buckets_perform_limit',
              action: row => {
                this.createDialog('BucketUpdateBucketLimitDialog', {
                  title: '设置上限',
                  data: [row],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
            },
            getSetPublicAction(this, {
              name: this.$t('dictionary.bucket'),
              scope: 'project',
              resource: 'buckets',
            }),
            {
              label: '设置读写权限',
              action: row => {
                this.createDialog('ObjectsUpdateAclDialog', {
                  title: '设置读写权限',
                  data: [row],
                  bucket: row,
                  resName: row.name,
                  columns: this.columns,
                  list: this.list,
                  refresh: this.refresh,
                })
              },
              // meta: row => {
              //   return {
              //     validate: this.list.selectedItems.every(row => !this.isDir(row.key)),
              //   }
              // },
            },
            {
              label: `更改${this.$t('dictionary.project')}`,
              permission: 'buckets_perform_change_owner',
              action: row => {
                this.createDialog('ChangeOwenrDialog', {
                  name: '存储桶',
                  data: [row],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  resource: 'buckets',
                })
              },
            },
            {
              label: '删除',
              permission: 'buckets_delete',
              action: row => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [row],
                  columns: this.columns,
                  title: '删除',
                  name: '存储桶',
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
