export default {
  created () {
    this.singleActions = [
      {
        label: `绑定${this.$t('dictionary.server')}`,
        action: (obj) => {
          this.createDialog('InstanceGroupBindServerDialog', {
            columns: this.columns,
            data: [obj],
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (obj) => ({
          validate: obj.enabled,
          tooltip: !obj.enabled ? '启用后重试' : null,
        }),
      },
      {
        label: '更多',
        actions: obj => {
          return [
            {
              label: '启用',
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
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: '删除主机组',
                  name: this.$t('dictionary.instancegroup'),
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
