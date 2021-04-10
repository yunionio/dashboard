import { k8sStatusColumn, k8sImageColumn } from '@K8S/utils/tableColumns'
import { getNameDescriptionTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
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
      {
        field: 'namespace',
        title: i18n.t('k8s.text_23'),
        width: 120,
        sortable: true,
      },
      k8sStatusColumn(),
      {
        field: 'podsInfo',
        title: i18n.t('k8s.text_9'),
        width: 70,
        formatter: ({ row }) => {
          return row.podsInfo ? (row.podsInfo.running + ' / ' + row.podsInfo.current) : '-'
        },
      },
      k8sImageColumn(),
      k8sImageColumn({ field: 'initContainerImages', title: i18n.t('k8s.text_66') }),
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
