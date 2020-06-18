import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('commo.edit'),
        permission: 'commonalerts_update',
        action: obj => {
          this.$router.push({
            path: `commonalerts/${obj.id}/update`,
          })
        },
      },
      {
        label: this.$t('common.text00109'),
        actions: row => [
          ...getEnabledSwitchActions(this, row, ['commonalerts_perform_enable', 'commonalerts_perform_disable']),
          {
            label: this.$t('common.delete'),
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
                title: this.$t('common.delete'),
                name: this.$t('dictionary.commonalert'),
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
