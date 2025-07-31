import i18n from '@/locales'
import { PROVIDER_MAP } from '@/constants'
export default {
  created () {
    this.singleActions = this.isListenerSidepage ? [] : [
      {
        label: i18n.t('network.text_130'),
        permission: 'lb_loadbalancerbackends_update',
        action: (obj) => {
          this.createDialog('BackendUpdateDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            updateFields: this.getUpdateFields(obj),
          })
        },
        meta: (obj) => {
          const fields = this.getUpdateFields(obj)
          const canUpdate = fields.weight && fields.port && fields.status
          return {
            validate: canUpdate,
            tooltip: canUpdate ? '' : i18n.t('compute.text_1388'),
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
        meta: (obj) => {
          if (this.isAliyunDefaultBackendGroup) {
            return {
              validate: false,
              tooltip: i18n.t('network.lb.default_backendgroup.tips'),
            }
          }
          if (obj.provider && (obj.provider.toLowerCase() === 'azure' || obj.provider.toLowerCase() === 'google')) {
            return {
              validate: false,
              tooltip: i18n.t('network.text_309', [PROVIDER_MAP[obj.provider].label]),
            }
          }
          return this.$getDeleteResult(obj)
        },
      },
    ]
  },
  methods: {
    getUpdateFields (obj) {
      const ret = { weight: true, port: true, status: true }
      const { provider = '' } = obj
      const lProvider = provider.toLowerCase()
      if (this.isAliyunDefaultBackendGroup) {
        ret.port = false
        ret.weight = false
      }
      if (lProvider !== 'cloudflare') {
        ret.status = false
      }
      if (lProvider === 'azure' || lProvider === 'google') {
        ret.port = false
        ret.weight = false
      } else if (lProvider === 'huawei') {
        ret.port = false
      } else if (lProvider === 'aws') {
        ret.port = false
        ret.weight = false
      } else if (lProvider === 'openstack') {
        ret.port = false
      }
      return ret
    },
  },
}
