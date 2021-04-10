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
        field: 'endpoints',
        title: i18n.t('k8s.text_240'),
        slots: {
          default: ({ row }) => {
            if (!row.endpoints) return '-'
            return row.endpoints.filter(v => v.host).map(v => {
              let value = '-'
              if (v.host && v.ports) value = `${v.host}:${v.ports}`
              if (v.host && !v.ports) value = v.host
              return <a-tag>{ value }</a-tag>
            })
          },
        },
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
