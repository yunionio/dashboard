import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.text_63'),
        permission: 'k8s_statefulsets_update',
        action: obj => {
          this.createDialog('K8SSetImageDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            success: () => {
              if (this.getResponseData) this.getResponseData()
            },
          })
        },
      },
      {
        label: i18n.t('k8s.text_68'),
        permission: 'k8s_statefulsets_update',
        action: obj => {
          this.createDialog('K8SSetLimitDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            success: () => {
              if (this.getResponseData) this.getResponseData()
            },
          })
        },
      },
      {
        label: i18n.t('k8s.text_196'),
        actions: obj => [
          {
            label: i18n.t('k8s.text_215'),
            permission: 'k8s_statefulsets_update',
            action: async () => {
              const manager = new this.$Manager('statefulsets', 'v1')
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
          {
            label: i18n.t('k8s.text_201'),
            permission: 'k8s_statefulsets_delete',
            action: () => {
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
                title: i18n.t('k8s.text_201'),
                name: i18n.t('k8s.text_5'),
                onManager: this.onManager,
                requestParams,
                success: () => {
                  if (this.getResponseData) this.getResponseData()
                },
              })
            },
          },
        ],
      },
    ]
  },
}
