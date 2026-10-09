import { k8sStatusColumn } from '@K8S/utils/tableColumns'
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
        field: 'parent',
        title: i18n.t('k8s.vc_parent'),
        width: 120,
        formatter: ({ row }) => row.parent || '-',
      },
      {
        field: 'weight',
        title: i18n.t('k8s.vc_weight'),
        width: 80,
      },
      {
        field: 'priority',
        title: i18n.t('k8s.vc_priority'),
        width: 90,
      },
      {
        field: 'reclaimable',
        title: i18n.t('k8s.vc_reclaimable'),
        width: 90,
        formatter: ({ row }) => row.reclaimable ? i18n.t('k8s.vc_yes') : i18n.t('k8s.vc_no'),
      },
      k8sStatusColumn({ statusModule: 'k8s_resource_vcqueue' }),
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
