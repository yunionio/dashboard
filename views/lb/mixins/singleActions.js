import _ from 'lodash'
import { PROVIDER_MAP } from '@/constants'
import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
const notSupportEnable = ['huawei', 'aws', 'qcloud']
const notSupportDisable = ['huawei', 'aws', 'qcloud']

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
            const notSupport = notSupportEnable.includes(obj.provider.toLowerCase())
            const label = notSupport ? _.get(PROVIDER_MAP, `[${obj.provider}].label`) : ''
            const tooltip = label ? `【${label}】暂不支持该操作` : ''
            return {
              validate: !notSupport && obj.status === 'disabled',
              tooltip,
            }
          },
          (obj) => {
            const notSupport = notSupportDisable.includes(obj.provider.toLowerCase())
            const label = notSupport ? _.get(PROVIDER_MAP, `[${obj.provider}].label`) : ''
            const tooltip = label ? `【${label}】暂不支持该操作` : ''
            return {
              validate: !notSupport && obj.status === 'enabled',
              tooltip,
            }
          },
        ],
      }),
      {
        label: '删除',
        permission: 'lb_loadbalancers_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: '删除',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}
