import expectStatus from '@/constants/expectStatus'
import { PROVIDER_MAP } from '@/constants'
import { getEnabledSwitchActions, disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { validateEnabled, validateDisable } from '../utils'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_201'),
        permission: 'lb_loadbalancers_perform_syncstatus',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: (obj) => {
          if (obj.brand && obj.brand.toLowerCase() === 'onecloud') {
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
        label: i18n.t('network.text_129'),
        actions: (obj) => {
          return [
            {
              label: i18n.t('compute.text_1179'),
              permission: 'lb_loadbalancers_perform_associate_eip',
              action: () => {
                this.createDialog('LbBindEipDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  singleRefresh: this.singleRefresh,
                })
              },
              meta: () => {
                const ret = {
                  validate: true,
                }
                if (!['OneCloud', 'Huawei'].includes(obj.brand) || obj.eip_mode === 'elastic_ip') {
                  ret.validate = false
                }
                if (obj.status === 'disabled') {
                  ret.validate = false
                  ret.tooltip = i18n.t('network.text_311')
                }
                return ret
              },
            },
            {
              label: i18n.t('compute.text_1264'),
              permission: 'lb_loadbalancers_perform_dissociate_eip',
              action: () => {
                this.createDialog('LbUnbindEipDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  singleRefresh: this.singleRefresh,
                })
              },
              meta: () => {
                const ret = {
                  validate: true,
                }
                if (!['OneCloud', 'Huawei'].includes(obj.brand) || obj.eip_mode !== 'elastic_ip' || !obj.eip_id) {
                  ret.validate = false
                }
                return ret
              },
            },
            {
              label: i18n.t('network.text_253'),
              permission: 'lb_loadbalancers_update',
              action: () => {
                this.createDialog('LbUpdateCluster', {
                  title: i18n.t('network.text_253'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const isOneCloud = obj.brand === 'OneCloud'
                return {
                  validate: isOneCloud,
                  tooltip: !isOneCloud && i18n.t('network.text_254'),
                }
              },
            },
            ...getEnabledSwitchActions(this, undefined, ['lb_loadbalancers_perform_enable', 'lb_loadbalancers_perform_disable'], {
              actions: [
                (obj) => {
                  this.onManager('performAction', {
                    steadyStatus: Object.values(expectStatus.lb).flat(),
                    id: obj.id,
                    managerArgs: {
                      action: 'status',
                      data: {
                        id: obj.id,
                        status: 'enabled',
                      },
                    },
                  })
                },
                (obj) => {
                  this.onManager('performAction', {
                    steadyStatus: Object.values(expectStatus.lb).flat(),
                    id: obj.id,
                    managerArgs: {
                      action: 'status',
                      data: {
                        id: obj.id,
                        status: 'disabled',
                      },
                    },
                  })
                },
              ],
              metas: [
                (obj) => {
                  let ret = {
                    validate: true,
                    tooltip: null,
                  }
                  ret = this.$isValidateResourceLock(obj)
                  if (!ret.validate) return ret
                  return validateEnabled([obj])
                },
                (obj) => {
                  let ret = {
                    validate: true,
                    tooltip: null,
                  }
                  ret = this.$isValidateResourceLock(obj)
                  if (!ret.validate) return ret
                  return validateDisable([obj])
                },
              ],
            }),
            disableDeleteAction(Object.assign(this, {
              permission: 'lb_loadbalancers_update',
            }), {
              name: this.$t('dictionary.loadbalancer'),
            }),
            {
              label: i18n.t('network.text_131'),
              permission: 'lb_loadbalancers_delete',
              action: () => {
                this.createDialog('DeleteLbDialog', {
                  vm: this,
                  title: i18n.t('network.text_131'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
        meta: (obj) => {
          let ret = {
            validate: true,
            tooltip: null,
          }
          if (obj.provider && (obj.provider.toLowerCase() === 'azure' || obj.provider.toLowerCase() === 'google')) {
            return {
              validate: false,
              tooltip: i18n.t('network.text_309', [PROVIDER_MAP[obj.provider].label]),
            }
          }
          ret = this.$isValidateResourceLock(obj)
          return ret
        },
      },
    ]
  },
}
