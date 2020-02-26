import { STRATEGY_CN } from '@Cloudenv/constants/sched'
import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'

const RES_TYPES = { hosts: '宿主机、物理机', storages: '存储', networks: '网络' }

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        vm: this,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'default_strategy',
        title: '偏好',
        width: 80,
        formatter: ({ row }) => {
          return STRATEGY_CN[row.default_strategy] || '无'
        },
      },
      {
        field: 'resource_type',
        title: '资源类型',
        width: 120,
        formatter: ({ row }) => {
          return RES_TYPES[row.resource_type] || '无'
        },
      },

      {
        field: 'resource_count',
        title: '资源数量',
        width: 80,
        formatter: ({ row }) => {
          return row.host_count || row.storage_count || row.network_count || '0'
        },
      },
      {
        field: 'dynamic_schedtag_count',
        title: '关联动态调度标签',
        width: 120,
        formatter: ({ row }) => {
          return row.dynamic_schedtag_count || '0'
        },
      },
      {
        field: 'schedpolicy_count',
        title: '关联调度策略',
        width: 120,
        formatter: ({ row }) => {
          return row.schedpolicy_count || '0'
        },
      },
    ]
  },
}
