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
        label: '调整标签',
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
        label: '更多',
        actions: obj => {
          return [
            {
              label: '修改属性',
              permission: 'networks_update',
              action: () => {
                const updatePath = this.$router.resolve(this.$route.path)
                this.$router.push({ path: updatePath.resolved.path + '/edit', query: { network_id: obj.id } })
              },
              meta: () => {
                let tooltip = ''
                const { brand, canUpdate } = canAdjustConfig(obj)
                const platform = findPlatform(brand)
                if (!canUpdate) {
                  tooltip = `${PROVIDER_FILTER_CN[platform]}的IP子网不能修改属性`
                }
                if (this.isPower(obj)) {
                  const { hasbrand, canUpdate } = canAdjustConfig(obj)
                  if (obj.cloud_env === 'onpremise' && obj.vpc_id !== 'default') {
                    return {
                      validate: false,
                      tooltip: '本地IDC的VPC下新建的IP子网不支持该操作',
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
                  tooltip = '权限不足'
                  return {
                    validate: false,
                    tooltip,
                  }
                }
              },
            },
            {
              label: `更改${this.$t('dictionary.project')}`,
              permission: 'networks_perform_change_owner',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  name: this.$t('network'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                return {
                  validate: this.isPower(obj),
                }
              },
            },
            getSetPublicAction(this, {
              name: this.$t('dictionary.network'),
              scope: 'project',
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
              label: '分割IP子网',
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
                      tooltip: '公网 IP 不支持该操作',
                    }
                  } else if (obj.cloud_env === 'onpremise' && obj.vpc_id !== 'default') {
                    return {
                      validate: false,
                      tooltip: '本地IDC的VPC下新建的IP子网不支持该操作',
                    }
                  } else {
                    return {
                      validate: true,
                    }
                  }
                } else {
                  return {
                    validate: false,
                    tooltip: '权限不足',
                  }
                }
              },
            },
            {
              label: '预留IP',
              permission: 'reservedips_create',
              action: (obj) => {
                this.createDialog('NetworkReversedIPDialog', {
                  data: [obj],
                  columns: this.columns,
                  title: '预留IP',
                  onManager: this.onManager,
                })
              },
              meta: () => {
                if (this.isDomainMode) {
                  return {
                    validate: false,
                    tooltip: '权限不足',
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: '同步状态',
              action: () => {
                this.onManager('performAction', {
                  steadyStatus: ['running', 'ready'],
                  id: obj.id,
                  managerArgs: {
                    action: 'syncstatus',
                  },
                })
              },
              meta: () => ({
                validate: true,
              }),
            },
            {
              label: '删除',
              permission: 'networks_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: '删除',
                  name: this.$t('network'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                if (!this.isPower(obj)) {
                  return {
                    validate: false,
                    tooltip: '权限不足',
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
