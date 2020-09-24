import { federatedResClusterCountColumn, k8sStatusColumn } from '@K8S/utils/tableColumns'
import { getTimeTableColumn } from '@/utils/common/tableColumn'
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
      federatedResClusterCountColumn(),
      getTimeTableColumn({ field: 'created_at', fromNow: true, sortable: true }),
    ]
  },
}
