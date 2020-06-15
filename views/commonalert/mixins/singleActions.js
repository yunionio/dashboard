import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: '修改',
        permission: 'commonalerts_update',
        action: obj => {
          this.$router.push({
            path: `commonalerts/${obj.id}`,
          })
        },
      },
      {
        label: '更多',
        actions: row => [
          ...getEnabledSwitchActions(this, row, ['commonalerts_perform_enable', 'commonalerts_perform_disable']),
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
            meta: (obj) => this.$getDeleteResult(obj),
          },
        ],
      },
    ]
  },
}
