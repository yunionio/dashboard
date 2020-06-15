import { getNameDescriptionTableColumn, getStatusTableColumn, getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: true,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'commonalert' }),
      getEnabledTableColumn(),
      {
        field: 'conditions',
        title: '策略详情',
        minWidth: 80,
        formatter: ({ row }) => {
          return '-'
        },
      },
      {
        field: 'level',
        title: '级别',
        slots: {
          default: ({ row }, h) => {
            const levelMap = {
              normal: {
                color: 'cyan',
                label: '普通',
              },
              system: {
                color: 'pink',
                label: '重要',
              },
              life: {
                color: 'red',
                label: '致命',
              },
            }
            const levelItem = levelMap[row.level]
            const text = levelItem ? levelItem.label : row.level
            return [h('a-tag', {
              props: {
                color: levelItem ? levelItem.color : levelMap.normal.color,
              },
            }, text)]
          },
        },
      },
      {
        field: 'conditions',
        title: '通知方式',
        minWidth: 80,
        formatter: ({ row }) => {
          return '-'
        },
      },
    ]
  },
}
