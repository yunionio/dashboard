export default {
  created () {
    this.singleActions = [
      {
        label: '设置为私有',
        permission: 'k8s_repos_perform_private',
        action: obj => {
          this.onManager('performAction', {
            id: obj.id,
            managerArgs: {
              action: 'private',
            },
          })
        },
        meta: (obj) => {
          return {
            validate: obj.is_public,
          }
        },
      },
      {
        label: '设置为公有',
        permission: 'k8s_repos_perform_public',
        action: obj => {
          this.onManager('performAction', {
            id: obj.id,
            managerArgs: {
              action: 'public',
            },
          })
        },
        meta: (obj) => {
          return {
            validate: !obj.is_public,
          }
        },
      },
      {
        label: '更多',
        actions: obj => [
          {
            label: '更新',
            permission: 'k8s_repos_update',
            action: async () => {
              this.createDialog('ChartCreateDialog', {
                data: [obj],
                columns: this.columns,
                onManager: this.onManager,
                formType: 'update',
              })
            },
          },
          {
            label: '删除',
            permission: 'k8s_repos_delete',
            action: () => {
              const requestParams = {
                cluster: obj.clusterID,
              }
              if (obj.namespace) {
                requestParams.namespace = obj.namespace
              }
              this.createDialog('DeleteResDialog', {
                vm: this,
                data: [obj],
                columns: this.columns,
                title: '删除',
                name: 'Helm仓库地址',
                onManager: this.onManager,
                idKey: 'name',
                requestParams,
              })
            },
            meta: () => {
              let validate = true
              let tooltip = ''
              if (obj.mountedBy && obj.mountedBy.length > 0) {
                validate = false
                tooltip = '请选择【未被使用】的存储卷'
              }
              return {
                validate,
                tooltip,
              }
            },
          },
        ],
      },
    ]
  },
}
