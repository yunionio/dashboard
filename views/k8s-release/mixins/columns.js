import { k8sStatusColumn } from '@K8S/utils/tableColumns'
import { getNameDescriptionTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'metadata',
        title: '应用',
        minWidth: 200,
        formatter: ({ row }) => {
          let text = row.chart || '-'
          if (row.chart_version) {
            text += `/${row.chart_version}`
          }
          return text
        },
      },
      k8sStatusColumn({ statusModule: 'release' }),
      {
        field: 'namespace',
        title: '命名空间',
        sortable: true,
        minWidth: 200,
      },
      getTimeTableColumn({ field: 'created_at', fromNow: true, sortable: true }),
    ]
  },
}
