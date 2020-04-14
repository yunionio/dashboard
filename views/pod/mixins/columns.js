import { k8sStatusColumn, k8sLabelColumn } from '@K8S/utils/tableColumns'
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
        field: 'podIP',
        title: 'IP',
        minWidth: '100px',
      },
      {
        field: 'namespace',
        title: '命名空间',
        width: 120,
        sortable: true,
      },
      k8sStatusColumn({ path: 'warnings' }),
      k8sLabelColumn(),
      {
        field: 'restartCount',
        title: '重启次数',
        minWidth: '80px',
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
