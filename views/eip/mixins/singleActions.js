import { typeClouds, findPlatform } from '@/utils/common/hypervisor'

const noChangeBandwidth = ['azure']

export default {
  created () {
    this.singleActions = [
      {
        label: '修改带宽',
        permission: 'eips_perform_change_bandwidth',
        action: (obj) => {
          this.createDialog('EipUpdateDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          if (!obj.associate_name) {
            return {
              validate: false,
              tooltip: '请您先绑定机器',
            }
          }
          let { brand } = obj
          if (brand) {
            brand = brand.toLowerCase()
            if (noChangeBandwidth.includes(brand)) {
              return {
                validate: false,
                tooltip: `${typeClouds.getHosttype()[brand].label}无法修改带宽`,
              }
            }
            const plaform = findPlatform(brand)
            if (plaform && plaform !== 'public') {
              return {
                validate: false,
                tooltip: '仅公有云eip支持修改带宽',
              }
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: '更多',
        actions: obj => {
          return [
            {
              label: '绑定',
              permission: 'eips_perform_associate',
              action: () => {
                this.createDialog('EipBindServerDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                return {
                  validate: !obj.associate_id && obj.status === 'ready',
                }
              },
            },
            {
              label: '解绑',
              permission: 'eips_perform_dissociate',
              action: () => {
                this.createDialog('EipUntieServerDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                if (obj.associate_id) {
                  return {
                    validate: true,
                  }
                }
                return {
                  validate: false,
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
              label: `更改${this.$t('dictionary.project')}`,
              permission: 'eips_perform_change_owner',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  name: this.$t('dictionary.eip'),
                  onManager: this.onManager,
                  resource: 'eips',
                })
              },
            },
            {
              label: '删除',
              permission: 'eips_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: '删除',
                  name: this.$t('dictionary.eip'),
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
