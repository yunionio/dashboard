import i18n from '@/locales'
export default {
  created () {
    this.singleActions = this.isListenerSidepage ? [] : [
      {
        label: i18n.t('network.text_349'),
        permission: 'lb_loadbalancerbackends_update',
        action: (obj) => {
          this.createDialog('BackendUpdatePortDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => {
          const { provider } = this.data
          if (provider.toLowerCase() === 'huawei') {
            return {
              validate: false,
              tooltip: i18n.t('network.text_354'),
            }
          }
          if (provider.toLowerCase() === 'aws') {
            return {
              validate: false,
              tooltip: i18n.t('common_464'),
            }
          }
          if (provider.toLowerCase() === 'openstack') {
            return {
              validate: false,
              tooltip: i18n.t('common_609'),
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('network.text_352'),
        permission: 'lb_loadbalancerbackends_update',
        action: (obj) => {
          this.createDialog('BackendUpdateWeightDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => {
          const { provider } = this.data
          if (provider.toLowerCase() === 'aws') {
            return {
              validate: false,
              tooltip: i18n.t('common_464'),
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('network.text_131'),
        permission: 'lb_loadbalancerbackends_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: i18n.t('network.text_131'),
            name: i18n.t('network.text_140'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
