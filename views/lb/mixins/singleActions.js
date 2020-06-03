import { validateEnabled, validateDisable } from '../utils'
import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

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
            return validateEnabled([obj])
          },
          (obj) => {
            return validateDisable([obj])
          },
        ],
      }),
      {
        label: '更多',
        actions: (obj) => {
          return [
            {
              label: '删除',
              permission: 'lb_loadbalancers_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: '删除',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
            {
              label: '更改集群',
              action: () => {
                this.createDialog('LbUpdateCluster', {
                  title: '更改集群',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => {
                const isOneCloud = obj.brand === 'OneCloud'
                return {
                  validate: isOneCloud,
                  tooltip: !isOneCloud && '仅OneCloud平台支持此操作',
                }
              },
            },
          ]
        },
      },
    ]
  },
}
