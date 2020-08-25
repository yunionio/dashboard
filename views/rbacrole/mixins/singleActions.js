import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.text_201'),
        permission: 'k8s_rbacroles_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('k8s.text_328'),
            name: i18n.t('k8s.text_24'),
            onManager: this.onManager,
            ok: (ids, data) => {
              return new this.$Manager(`${data[0].type}s`, 'v1').batchDelete({
                ids,
                data: {
                  cluster: data[0].clusterID,
                  namespace: data[0].namespace,
                },
              }).then(() => {
                if (this.getResponseData) {
                  this.getResponseData()
                } else {
                  this.destroySidePages()
                  this.refresh()
                }
                return true
              }).catch(error => {
                throw error
              })
            },
          })
        },
      },
      {
        label: i18n.t('k8s.text_215'),
        permission: 'k8s_rbacroles_update',
        action: async obj => {
          const manager = new this.$Manager('rbacroles', 'v1')
          async function fetchData () {
            const { cluster, namespace } = obj
            const { data } = await manager.getSpecific({ id: obj.name, spec: 'rawdata', params: { cluster, namespace } })
            return data
          }
          const configText = await fetchData()
          this.createDialog('K8SEditYamlDialog', {
            data: [obj],
            manager,
            refresh: this.refresh,
            configText,
            success: () => {
              if (this.getResponseData) this.getResponseData()
            },
          })
        },
      },
    ]
  },
}
