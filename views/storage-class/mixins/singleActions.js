import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.text_363'),
        permission: 'k8s_storageclasses_perform_set_default',
        action: obj => {
          new this.$Manager('storageclasses', 'v1').performAction({
            id: obj.name,
            action: 'set-default',
            data: { cluster: obj.cluster },
          }).then(() => {
            this.refresh()
          })
        },
      },
      {
        label: i18n.t('k8s.text_201'),
        permission: 'k8s_storageclasses_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('k8s.text_347'),
            name: i18n.t('k8s.text_22'),
            onManager: this.onManager,
            requestData: {
              cluster: obj.clusterID,
            },
            requestParams: {
              id: obj.name,
            },
          })
        },
      },
      {
        label: i18n.t('k8s.text_215'),
        permission: 'k8s_storageclasses_update',
        action: async obj => {
          const manager = new this.$Manager('storageclasses', 'v1')
          async function fetchData () {
            const { cluster, namespace } = obj
            const { data } = await manager.getSpecific({ id: obj.id, spec: 'rawdata', params: { cluster, namespace } })
            return data
          }
          const configText = await fetchData()
          this.createDialog('K8SEditYamlDialog', {
            data: [obj],
            manager,
            refresh: this.refresh,
            configText,
          })
        },
      },
    ]
  },
}
