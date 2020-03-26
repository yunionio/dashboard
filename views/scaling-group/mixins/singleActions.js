export default {
  created () {
    this.singleActions = [
      {
        label: '启用',
        action: obj => {
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
        meta: (obj) => {
          return {
            validate: obj.enabled,
          }
        },
      },
      {
        label: '删除',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            data: [obj],
            columns: this.columns,
            title: '删除',
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          return {
            validate: !obj.enabled,
            tooltip: obj.enabled && '请先禁用弹性伸缩组',
          }
        },
      },
    ]
  },
}
