import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      // {
      //   label: '升级',
      //   permission: 'k8s_releases_update',
      //   action: async obj => {
      //     this.$router.push({
      //       path: `/k8s-release/update/${obj.name}`,
      //       query: {
      //         cluster: obj.clusterID,
      //         namespace: obj.namespace,
      //         chart: obj.chart,
      //         repo: obj.repo_id,
      //       },
      //     })
      //   },
      // },
      // {
      //   label: '回滚',
      //   permission: 'k8s_releases_perform_rollback',
      //   action: async obj => {
      //     this.createDialog('K8SRollbackDialog', {
      //       data: [obj],
      //       columns: this.columns,
      //       onManager: this.onManager,
      //       cluster: obj.clusterID,
      //       namespace: obj.namespace,
      //     })
      //   },
      // },
      {
        label: i18n.t('helm.text_69'),
        permission: 'k8s_releases_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('helm.text_69'),
            name: i18n.t('helm.text_3'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
