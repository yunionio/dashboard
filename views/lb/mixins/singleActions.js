import { validateEnabled, validateDisable } from '../utils'
import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
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
        label: i18n.t('network.text_129'),
        actions: (obj) => {
          return [
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
          ret = this.$isValidateResourceLock(obj)
          return ret
        },
      },
    ]
  },
}
