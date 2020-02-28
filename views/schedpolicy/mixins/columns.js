import { STRATEGY_CN } from '@Cloudenv/constants/sched'
import { getNameDescriptionTableColumn, getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn(),
      {
        field: 'strategy',
        title: '偏好',
        width: 80,
        formatter: ({ row }) => {
          return STRATEGY_CN[row.strategy] || '无'
        },
      },
      getCopyWithContentTableColumn({
        field: 'schedtag',
        title: '调度标签',
      }),
      getCopyWithContentTableColumn({
        field: 'condition',
        title: '条件',
      }),
    ]
  },
}
