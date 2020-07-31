import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: '请输入名称' },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name_cn ? `${row.name}(${row.name_cn})` : row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'hosts',
        title: '物理机/可用物理机',
        width: 140,
        formatter: ({ row }) => {
          return `${row.hosts}/${row.hosts_enabled}`
        },
      },
      {
        field: 'baremetals',
        title: '受管物理机/可用受管物理机',
        width: 180,
        formatter: ({ row }) => {
          return `${row.baremetals}/${row.baremetals_enabled}`
        },
      },
      {
        field: 'wires',
        title: '二层网络',
        width: 70,
      },
    ]
  },
}
