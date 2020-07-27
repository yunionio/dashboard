import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  computed: {
    singleActions () {
      if (this.$store.getters.scope === 'project') {
        return [
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
        ]
      }
      return [
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
          label: i18n.t('k8s.text_196'),
          actions: obj => {
            return [
              {
                label: i18n.t('k8s.text_197'),
                permission: 'k8s_kubeclusters_perform_private',
                action: () => {
                  this.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'private',
                    },
                  }).then(() => {
                    this.$message.success(i18n.t('k8s.text_198', [i18n.t('dictionary.project')]))
                  })
                },
                meta: (obj) => {
                  return {
                    validate: obj.is_public,
                  }
                },
              },
              {
                label: i18n.t('k8s.text_155'),
                permission: 'k8s_kubeclusters_perform_public',
                action: () => {
                  this.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'public',
                    },
                  }).then(() => {
                    this.$message.success(i18n.t('k8s.text_200', [i18n.t('dictionary.project')]))
                  })
                },
                meta: (obj) => {
                  return {
                    validate: !obj.is_public,
                  }
                },
              },
              {
                label: i18n.t('k8s.text_201'),
                permission: 'k8s_kubeclusters_delete',
                action: () => {
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
                meta: () => {
                  return this.$getDeleteResult(obj)
                },
              },
            ]
          },
        },
      ]
    },
  },
}
