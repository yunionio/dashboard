export default {
  created () {
    this.singleActions = [
      {
        label: '启用',
        action: (obj) => {
          this.onManager('performAction', {
            id: obj.id,
            managerArgs: {
              action: 'enable',
            },
          })
        },
        meta: (obj) => ({
          validate: !obj.enabled,
        }),
      },
      {
        label: '禁用',
        action: (obj) => {
          this.onManager('performAction', {
            id: obj.id,
            managerArgs: {
              action: 'disable',
            },
          })
        },
        meta: (obj) => ({
          validate: obj.enabled,
        }),
      },
      {
        label: '更多',
        actions: obj => {
          return [
            {
              label: '修改',
              action: () => {
                this.createDialog('DnsCreateDialog', {
                  title: '修改',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  type: 'update',
                })
              },
              meta: (obj) => ({
                validate: obj.can_update,
              }),
            },
            {
              label: '克隆',
              action: () => {
                this.createDialog('DnsCreateDialog', {
                  title: '克隆',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  type: 'clone',
                })
              },
            },
            {
              label: '删除',
              permission: 'dnsrecords_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  title: '删除',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  success: () => {
                    this.destroySidePages()
                  },
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
