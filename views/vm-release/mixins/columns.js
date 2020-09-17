import { k8sStatusColumn } from '@K8S/utils/tableColumns'
import { getNameDescriptionTableColumn, getTimeTableColumn, getProjectTableColumn, getProjectDomainTableColumn } from '@/utils/common/tableColumn'
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
        field: 'metadata',
        title: i18n.t('helm.text_75'),
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
      getProjectTableColumn(),
      getTimeTableColumn({ field: 'created_at', fromNow: true, sortable: true }),
      getProjectDomainTableColumn(),
    ]
  },
}
