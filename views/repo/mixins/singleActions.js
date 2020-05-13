import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      getSetPublicAction(this, {
        name: 'Helm仓库地址',
        scope: 'project',
      }),
      {
        label: '删除',
        permission: 'k8s_repos_delete',
        action: (obj) => {
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
        meta: (obj) => {
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
    ]
  },
}
