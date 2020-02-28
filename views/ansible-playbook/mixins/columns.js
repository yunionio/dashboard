import { getStatusTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        isNameEdit: false,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'ansiblePlaybook', title: '上一次执行状态' }),
      getTimeTableColumn({
        field: 'start_time',
        title: '开始时间',
      }),
      getTimeTableColumn({
        field: 'end_time',
        title: '结束时间',
      }),
      getProjectTableColumn(),
    ]
  },
}
