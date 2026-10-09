import i18n from '@/locales'

function isSystemQueue (name) {
  return name === 'root' || name === 'default'
}

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.vc_edit'),
        permission: 'k8s_vcqueues_update',
        action: obj => {
          this.$router.push({
            path: '/k8s-vcqueue/update',
            query: { id: obj.id, cluster: obj.clusterID },
          })
        },
      },
      {
        label: i18n.t('k8s.text_201'),
        permission: 'k8s_vcqueues_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            data: [obj],
            columns: this.columns,
            title: i18n.t('k8s.text_201'),
            name: i18n.t('k8s.vc_queue'),
            onManager: this.onManager,
            requestData: {
              cluster: obj.clusterID,
            },
          })
        },
        meta: obj => {
          if (isSystemQueue(obj.name)) {
            return {
              validate: false,
              tooltip: i18n.t('k8s.vc_system_queue'),
            }
          }
          return { validate: true }
        },
      },
    ]
  },
}
