import { mapGetters } from 'vuex'
import { disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_201'),
        permission: 'cdn_domains_perform_syncstatus',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['offline', 'online'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: (obj) => {
          if (!this.isOwner(obj)) {
            return {
              validate: false,
              tooltip: i18n.t('network.text_627'),
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('network.text_129'),
        actions: (obj) => {
          return [
            {
              label: i18n.t('compute.text_1100'),
              permission: 'cdn_domains_perform_change_config',
              action: () => {
                this.createDialog('CdnDomainChangeConfigDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => {
                if (obj.provider !== 'Cloudflare') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_1388'),
                  }
                }
                return { validate: true }
              },
            },
            {
              label: i18n.t('network.cdn.clear_cache'),
              permission: 'cdn_domains_perform_clear_cache',
              action: () => {
                this.createDialog('CdnDomainClearCacheDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => {
                if (obj.provider !== 'Cloudflare') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_1388'),
                  }
                }
                return { validate: true }
              },
            },
            {
              label: i18n.t('network.text_225', [i18n.t('dictionary.project')]),
              permission: 'cdn_domains_perform_change_owner',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  name: this.$t('dictionary.cdn_domain'),
                  onManager: this.onManager,
                  resource: 'cdn_domains',
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: '',
                }
                if (this.isProjectMode) {
                  ret.tooltip = i18n.t('common_601')
                  return ret
                }
                return {
                  validate: true,
                }
              },
            },
            disableDeleteAction(Object.assign(this, {
              permission: 'cdn_domains_update',
            }), {
              name: this.$t('dictionary.cdn_domain'),
              meta: () => {
                if (!this.isOwner(obj)) {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_627'),
                  }
                }
              },
            }),
            {
              label: i18n.t('network.text_131'),
              permission: 'cdn_domains_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('network.text_131'),
                  name: this.$t('dictionary.cdn_domain'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  requestData: { force: true },
                  refresh: this.refresh,
                })
              },
              meta: () => {
                if (!this.isOwner(obj)) {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_627'),
                  }
                }
                return this.$getDeleteResult(obj)
              },
            },
          ]
        },
      },
    ]
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  methods: {
    isOwner (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return false
    },
  },
}
