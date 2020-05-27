import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      ...getEnabledSwitchActions(this, undefined, ['scalinggroups_perform_enable', 'scalinggroups_perform_disable']),
      {
        label: '删除',
        permission: 'scalinggroups_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            title: '删除',
            name: '弹性伸缩组',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            steadyStatus: Object.values(expectStatus.scalinggroup).flat(),
          })
        },
        meta: (obj) => {
          let tooltip = ''
          if (obj.enabled) {
            tooltip = '请先禁用弹性伸缩组'
          }
          if (obj.instance_number) {
            tooltip = '伸缩组内虚拟机不为空，请删除后重试'
          }
          return {
            validate: !obj.enabled && !obj.instance_number,
            tooltip,
          }
        },
      },
    ]
  },
}
