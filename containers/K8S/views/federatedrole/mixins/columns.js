import { federatedResClusterCountColumn, k8sStatusColumn, federatednamespaceColumn } from '@K8S/utils/tableColumns'
import { getTimeTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'

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
      k8sStatusColumn(),
      federatedResClusterCountColumn(),
      federatednamespaceColumn(),
      getTimeTableColumn({ field: 'created_at', fromNow: true, sortable: true }),
    ]
  },
}
