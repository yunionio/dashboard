import { weekOptions, timeOptions } from '../constants'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'snapshotpolicy' }),
      {
        filed: 'binding_disk_count',
        title: '关联硬盘数量',
        width: 120,
        formatter: ({ row }) => {
          return row.binding_disk_count
        },
      },
      {
        filed: 'repeat_weekdays',
        title: '策略详情',
        minWidth: 180,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            let text = ''
            if (row.repeat_weekdays && row.repeat_weekdays.length) {
              text += '每' + row.repeat_weekdays.map(item => weekOptions[item - 1]).join('、')
            }
            if (row.time_points && row.time_points.length) {
              text += '; ' + row.time_points.map(item => timeOptions[item]).join('、')
            }
            if (text) {
              text += '自动创建快照'
            }
            return [
              <list-body-cell-wrap copy field='repeat_weekdays' hideField row={row} message={text}>
                {{ text }}
              </list-body-cell-wrap>,
            ]
          },
        },
      },
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
