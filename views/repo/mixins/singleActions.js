import { getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      getSetPublicAction(this, {
        name: i18n.t('helm.text_6'),
        scope: 'project',
        resource: 'repos',
        apiVersion: 'v1',
      }),
      {
        label: i18n.t('helm.text_69'),
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
            title: i18n.t('helm.text_69'),
            name: i18n.t('helm.text_6'),
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
            tooltip = i18n.t('helm.text_97')
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
