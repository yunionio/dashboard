export default {
  created () {
    this.singleActions = [
      {
        label: '克隆',
        permission: 'skus_create',
        action: obj => {
          this.createDialog('CloneSkuUpdateDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => {
          let tooltip
          if (!obj.enabled) tooltip = '请先设置启用'
          return {
            validate: obj.enabled,
            tooltip,
          }
        },
      },
      {
        label: '更多',
        actions: obj => {
          return [
            {
              label: '启用',
              permission: 'skus_update',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  managerArgs: {
                    action: 'enable',
                  },
                })
              },
              meta: () => ({
                validate: !obj.enabled,
              }),
            },
            {
              label: '禁用',
              permission: 'skus_update',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  managerArgs: {
                    action: 'disable',
                  },
                })
              },
              meta: () => ({
                validate: obj.enabled,
              }),
            },
            {
              label: '删除',
              permission: 'skus_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: '删除',
                  name: this.$t('dictionary.sku'),
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
