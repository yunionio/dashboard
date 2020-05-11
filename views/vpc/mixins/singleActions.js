import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: '同步状态',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: (obj) => {
          if (obj.brand.toLowerCase() === 'onecloud') {
            return {
              validate: false,
              tooltip: '本地IDC资源不支持该操作',
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: '更多',
        actions: obj => {
          return [
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.vpc'),
              resource: 'vpcs',
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.vpc'),
              scope: 'domain',
            }),
            {
              label: '删除',
              permission: 'vpcs_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: '删除',
                  name: this.$t('dictionary.vpc'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
