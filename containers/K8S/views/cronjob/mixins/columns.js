import { getNameDescriptionTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'
import { k8sStatusColumn } from '@K8S/utils/tableColumns'

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
        field: 'namespace',
        title: i18n.t('k8s.text_23'),
        width: 120,
        sortable: true,
      },
      k8sStatusColumn(),
      {
        field: 'schedule',
        title: i18n.t('k8s.text_222'),
        width: 100,
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
