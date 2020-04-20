import expectStatus from '@/constants/expectStatus'
export default {
  created () {
    this.singleActions = [
      {
        label: '启用',
        action: obj => {
          this.createDialog('ScalingGroupEnable', {
            data: [obj],
            columns: this.columns,
            title: '删除',
            onManager: this.onManager,
          })
        },
        meta: (obj) => ({
          validate: !obj.enabled,
        }),
      },
      {
        label: '禁用',
        action: (obj) => {
          this.createDialog('ScalingGroupDisable', {
            data: [obj],
            columns: this.columns,
            title: '删除',
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          return {
            validate: obj.enabled,
          }
        },
      },
      {
        label: '删除',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            steadyStatus: Object.values(expectStatus.scalinggroup).flat(),
            data: [obj],
            columns: this.columns,
            title: '删除',
            onManager: this.onManager,
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
