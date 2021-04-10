import { getTimeTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { k8sStatusColumn } from '@K8S/utils/tableColumns'
import i18n from '@/locales'

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
      {
        field: 'isDefault',
        title: i18n.t('k8s.text_359'),
        minWidth: 100,
        formatter: ({ row }) => {
          return row.isDefault ? i18n.t('k8s.text_360') : i18n.t('k8s.text_361')
        },
      },
      {
        field: 'provisioner',
        title: i18n.t('k8s.text_362'),
        minWidth: 100,
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
