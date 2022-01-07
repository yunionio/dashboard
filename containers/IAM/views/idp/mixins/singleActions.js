import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('system.text_246'),
        permission: 'idps_update',
        action: (obj) => {
          this.jumpTo(`update/${obj.id}`)
        },
        meta: (obj) => {
          const ret = {
            validate: false,
            tooltip: null,
          }
          if (obj.driver === 'sql') {
            ret.tooltip = i18n.t('system.text_247', [i18n.t('dictionary.identity_provider')])
            return ret
          }
          if (obj.enabled) {
            ret.tooltip = i18n.t('system.text_249')
            return ret
          }
          ret.validate = true
          return ret
        },
      },
      {
        label: i18n.t('system.text_153'),
        actions: obj => {
          return [
            // {
            //   label: i18n.t('common_551'),
            //   action: async (obj) => {
            //     this.createDialog('IdpBaseConfigDialog', {
            //       data: [obj],
            //       title: i18n.t('common_551'),
            //       columns: this.columns,
            //     })
            //   },
            //   meta: () => {
            //     if (obj.driver === 'ldap' || obj.driver === 'sql') {
            //       return {
            //         validate: false,
            //         tooltip: i18n.t('common_552'),
            //       }
            //     }
            //     return {
            //       validate: true,
            //     }
            //   },
            // },
            ...getEnabledSwitchActions(this, undefined, ['idps_perform_enable', 'idps_perform_disable']),
            {
              label: i18n.t('system.text_250'),
              permission: 'idps_perform_sync',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  steadyStatus: {
                    sync_status: ['idle'],
                  },
                  managerArgs: {
                    action: 'sync',
                  },
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.driver === 'sql') {
                  ret.tooltip = i18n.t('system.text_251', [i18n.t('dictionary.identity_provider')])
                  return ret
                }
                if (!obj.enabled) {
                  ret.tooltip = i18n.t('system.text_252')
                  return ret
                }
                ret.validate = true
                return ret
              },
            },
            {
              label: i18n.t('system.text_129'),
              permission: 'idps_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('system.text_129'),
                  onManager: this.onManager,
                  name: this.$t('dictionary.identity_provider'),
                  alertProps: {
                    message: i18n.t('system.text_253'),
                    type: 'error',
                  },
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
  methods: {
    downloadXml (idp, metadataStr) {
      console.log(metadataStr)
      const eleLink = document.createElement('a')
      eleLink.download = `${idp.name}.xml`
      const blob = new Blob([metadataStr])
      eleLink.href = URL.createObjectURL(blob)
      document.body.appendChild(eleLink)
      eleLink.click()
    },
  },
}
