import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  computed: {
    singleActions () {
      const actions = [
        {
          label: i18n.t('k8s.text_195'),
          permission: 'k8s_kubeclusters_get_kubeconfig',
          action: obj => {
            this.createDialog('ClusterShowKubeConfigDialog', {
              data: [obj],
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
        },
        {
          label: i18n.t('scope.text_528'),
          permission: 'k8s_kubeclusters_perform_sync',
          action: (obj) => {
            this.onManager('performAction', {
              id: obj.id,
              steadyStatus: ['idle'],
              managerArgs: {
                action: 'sync',
              },
            })
          },
        },
      ]
      if (this.$store.getters.scope !== 'project') {
        actions.push({
          label: i18n.t('k8s.text_201'),
          permission: 'k8s_kubeclusters_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: [
                getNameDescriptionTableColumn({
                  onManager: this.onManager,
                  hideField: true,
                  slotCallback: row => {
                    return (
                      <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
                    )
                  },
                }),
                {
                  field: 'version',
                  title: i18n.t('k8s.text_153'),
                  slots: {
                    default: ({ row }, h) => {
                      return [
                        <a-tag color="blue">{ row.version }</a-tag>,
                      ]
                    },
                  },
                },
                {
                  field: 'machines',
                  title: i18n.t('k8s.text_191'),
                },
              ],
              title: i18n.t('k8s.text_201'),
              name: this.$t('dictionary.kubecluster'),
              onManager: this.onManager,
              success: () => {
                this.destroySidePages()
              },
            })
          },
          meta: obj => {
            return this.$getDeleteResult(obj)
          },
        })
      }
      return actions
    },
  },
}
