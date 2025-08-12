import { typeClouds } from '@/utils/common/hypervisor'
import i18n from '@/locales'

const supportChangeBandwidth = ['huawei', 'baidu', 'aliyun', 'ucloud', 'qcloud', 'ctyun']

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_220'),
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
              tooltip: i18n.t('network.text_222'),
            }
          }
          const { brand } = obj
          if (brand && !supportChangeBandwidth.includes(brand.toLowerCase())) {
            return {
              validate: false,
              tooltip: i18n.t('network.text_223', [typeClouds.getHosttype()[brand.toLowerCase()].label]),
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('network.text_129'),
        actions: obj => {
          return [
            {
              label: i18n.t('network.text_202'),
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
              label: i18n.t('network.text_219'),
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
                if (obj.brand === 'Aws' && obj.associate_type === 'natgateway') {
                  return {
                    validate: false,
                    tooltip: this.$t('common.check_readonly', ['Aws', i18n.t('network.unbind_net_gateway')]),
                  }
                }
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
              label: i18n.t('network.text_201'),
              permission: 'eips_perform_syncstatus',
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
              label: i18n.t('network.text_225', [i18n.t('dictionary.project')]),
              permission: 'eips_perform_change_owner',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  name: this.$t('dictionary.eip'),
                  onManager: this.onManager,
                  resource: 'eips',
                  refresh: this.refresh,
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
            {
              label: i18n.t('network.text_131'),
              permission: 'eips_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('network.text_131'),
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
