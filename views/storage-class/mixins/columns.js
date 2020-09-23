import { getTimeTableColumn } from '@/utils/common/tableColumn'
import { k8sStatusColumn } from '@K8S/utils/tableColumns'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      {
        field: 'name',
        title: i18n.t('k8s.text_41'),
        width: 300,
        slots: {
          default: ({ row }, h) => {
            const ret = [<side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>]
            return ret
          },
        },
      },
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
