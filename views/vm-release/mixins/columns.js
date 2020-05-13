import { k8sStatusColumn } from '@K8S/utils/tableColumns'
import { getNameDescriptionTableColumn, getTimeTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'

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
        formatter: ({ row }) => `${row.chart}/${row.chart_version || ''}`,
      },
      k8sStatusColumn({ statusModule: 'release' }),
      getProjectTableColumn(),
      getTimeTableColumn({ field: 'created_at', fromNow: true, sortable: true }),
    ]
  },
}
