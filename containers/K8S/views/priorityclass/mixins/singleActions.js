import i18n from '@/locales'

function isSystemPriorityClass (name) {
  return name === 'system-cluster-critical' || name === 'system-node-critical'
}

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.text_201'),
        permission: 'k8s_priorityclasses_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            data: [obj],
            columns: this.columns,
            title: i18n.t('k8s.text_201'),
            name: i18n.t('k8s.vc_priority_class'),
            onManager: this.onManager,
            requestData: {
              cluster: obj.clusterID,
            },
          })
        },
        meta: obj => {
          if (isSystemPriorityClass(obj.name)) {
            return {
              validate: false,
              tooltip: i18n.t('k8s.vc_system_priority_class'),
            }
          }
          return { validate: true }
        },
      },
    ]
  },
}
