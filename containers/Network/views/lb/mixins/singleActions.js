import { validateEnabled, validateDisable } from '../utils'
import expectStatus from '@/constants/expectStatus'
import { PROVIDER_MAP } from '@/constants'
import { getEnabledSwitchActions, disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

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
        label: i18n.t('network.text_129'),
        actions: (obj) => {
          return [
            ...getEnabledSwitchActions(this, undefined, undefined, {
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
            {
              label: i18n.t('network.text_253'),
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
            disableDeleteAction(this, {
              name: this.$t('dictionary.loadbalancer'),
            }),
            {
              label: i18n.t('network.text_131'),
              permission: 'lb_loadbalancers_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
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
          if (obj.provider.toLowerCase() === 'azure') {
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
