import { mapGetters } from 'vuex'
import i18n from '@/locales'
import { findPlatform } from '@/utils/common/hypervisor'
import { getSetPublicAction } from '@/utils/common/tableActions'

const PROVIDER_FILTER_CN = i18n.t('env')
const disableAdjustConfig = ['private', 'public']
const canAdjustConfig = (obj) => {
  const config = {
    hasbrand: true,
    canUpdate: true,
    brand: '',
  }
  let brand = obj.brand || obj.provider
  config.brand = brand
  if (!brand) config.hasbrand = false
  brand = brand.toLowerCase()
  const platform = findPlatform(brand)
  if (disableAdjustConfig.includes(platform)) config.canUpdate = false
  return config
}

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_648'),
        permission: 'schedtags_list,networks_perform_set_schedtag',
        action: (obj) => {
          this.createDialog('AdjustLabelDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          return {
            validate: this.isPower(obj),
          }
        },
      },
      {
        label: i18n.t('network.text_129'),
        actions: obj => {
          return [
            {
              label: i18n.t('network.text_606'),
              permission: 'networks_update',
              action: () => {
                this.$router.push({ path: '/network/edit', query: { network_id: obj.id } })
              },
              meta: () => {
                let tooltip = ''
                const { brand, canUpdate } = canAdjustConfig(obj)
                const platform = findPlatform(brand)
                if (!canUpdate) {
                  tooltip = i18n.t('network.text_649', [PROVIDER_FILTER_CN[platform]])
                }
                if (this.isPower(obj)) {
                  const { hasbrand, canUpdate } = canAdjustConfig(obj)
                  if (obj.cloud_env === 'onpremise' && obj.vpc_id !== 'default') {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_650'),
                    }
                  }
                  if (!hasbrand) {
                    return {
                      validate: true,
                      tooltip,
                    }
                  }
                  return {
                    validate: canUpdate,
                    tooltip,
                  }
                } else {
                  tooltip = i18n.t('network.text_627')
                  return {
                    validate: false,
                    tooltip,
                  }
                }
              },
            },
            {
              label: i18n.t('network.text_225', [i18n.t('dictionary.project')]),
              permission: 'networks_perform_change_owner',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  name: this.$t('dictionary.network'),
                  onManager: this.onManager,
                  resource: 'networks',
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: '',
                }
                if (this.isProjectMode) {
                  ret.tooltip = i18n.t('monitor.text_9', [this.$t('dictionary.domain')])
                  return ret
                }
                if (obj.is_public && obj.public_scope !== 'none') {
                  ret.validate = false
                  ret.tooltip = this.$t('common_280')
                  return ret
                }
                return {
                  validate: this.isPower(obj),
                }
              },
            },
            getSetPublicAction(this, {
              name: this.$t('dictionary.network'),
              scope: 'project',
              resource: 'networks',
            }),
            // {
            //   label: '设置为共享',
            //   permission: 'networks_perform_public',
            //   action: () => {
            //     this.createDialog('SetPublicDialog', {
            //       data: [obj],
            //       title: '设置为共享',
            //       columns: this.columns,
            //       onManager: this.onManager,
            //     })
            //   },
            //   meta: () => {
            //     return {
            //       validate: this.isPower(obj),
            //     }
            //   },
            // },
            {
              label: i18n.t('network.text_632'),
              permission: 'networks_perform_split',
              action: () => {
                this.createDialog('NetworkSplitDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                if (this.isPower(obj)) {
                  if (obj.external_id && obj.external_id.length > 0) { // 是公网 IP
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_624'),
                    }
                  } else if (obj.cloud_env === 'onpremise' && obj.vpc_id !== 'default') {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_650'),
                    }
                  } else {
                    return {
                      validate: true,
                    }
                  }
                } else {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_627'),
                  }
                }
              },
            },
            {
              label: i18n.t('network.text_651'),
              permission: 'reservedips_create',
              action: (obj) => {
                this.createDialog('NetworkReversedIPDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('network.text_651'),
                  onManager: this.onManager,
                })
              },
              meta: (obj) => {
                if (!this.isPower(obj)) {
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
              label: i18n.t('network.text_201'),
              permission: 'networks_perform_syncstatus',
              action: () => {
                this.onManager('performAction', {
                  steadyStatus: ['running', 'ready'],
                  id: obj.id,
                  managerArgs: {
                    action: 'syncstatus',
                  },
                })
              },
              meta: (obj) => {
                if (!this.isPower(obj)) {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_627'),
                  }
                }
                if (obj.brand.toLowerCase() === 'onecloud') {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_652'),
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: i18n.t('network.text_131'),
              permission: 'networks_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('network.text_131'),
                  name: this.$t('dictionary.network'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                if (!this.isPower(obj)) {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_627'),
                  }
                }
                if (!this.$getDeleteResult(obj).validate) {
                  return {
                    validate: false,
                    tooltip: this.$getDeleteResult(obj).tooltip,
                  }
                }
                return {
                  validate: true,
                  tooltip: '',
                }
              },
            },
            {
              label: this.$t('common_564'),
              action: () => {
                this.createDialog('NetworkUpdateIsAutoAllocDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('common_564'),
                  name: this.$t('dictionary.network'),
                  onManager: this.onManager,
                })
              },
              meta: (obj) => {
                if (obj.server_type !== 'baremetal' && obj.server_type !== 'guest') {
                  return {
                    validate: false,
                    tooltip: this.$t('common_565'),
                  }
                }
                return {
                  validate: true,
                }
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
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
