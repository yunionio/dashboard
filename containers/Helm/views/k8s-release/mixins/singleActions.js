import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('helm.upgrade'),
        permission: 'k8s_releases_update',
        action: async obj => {
          this.$router.push({
            path: `/k8s-release/update/${obj.id}`,
            query: {
              cluster: obj.clusterID,
              namespace: obj.namespace,
              chart: obj.chart,
            },
          })
        },
        meta: (obj) => {
          const ret = { validate: true }
          if (!obj.chart) {
            ret.validate = false
            return ret
          }
          return ret
        },
      },
      {
        label: this.$t('helm.text_72'),
        permission: 'k8s_releases_perform_rollback',
        action: async obj => {
          this.createDialog('K8SRollbackDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            cluster: obj.clusterID,
            namespace: obj.namespace,
          })
        },
        meta: (obj) => {
          const ret = { validate: true }
          if (!obj.chart) {
            ret.validate = false
            return ret
          }
          return ret
        },
      },
      {
        label: i18n.t('helm.text_69'),
        permission: 'k8s_releases_delete',
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
            title: i18n.t('helm.text_69'),
            name: i18n.t('helm.text_4'),
            onManager: this.onManager,
            requestParams,
          })
        },
      },
    ]
  },
}
