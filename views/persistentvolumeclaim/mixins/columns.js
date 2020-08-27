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
        field: 'namespace',
        title: i18n.t('k8s.text_23'),
        sortable: true,
      },
      k8sStatusColumn(),
      {
        field: 'volume',
        title: i18n.t('k8s.text_311'),
        minWidth: 120,
      },
      {
        field: 'capacity.storage',
        title: i18n.t('k8s.text_312'),
        width: 70,
        formatter: ({ row }) => {
          return row.capacity ? (row.capacity.storage || '0Gi') : '-'
        },
      },
      {
        field: 'accessModes',
        title: i18n.t('k8s.text_313'),
        formatter: ({ row }) => (row.accessModes || []).join('，'),
      },
      {
        field: 'storageClass',
        title: i18n.t('k8s.text_22'),
      },
      {
        field: 'unused',
        title: i18n.t('k8s.text_301'),
        slots: {
          default: ({ row }, h) => {
            let text = i18n.t('k8s.text_303')
            let className = 'success-color'
            if (row.mountedBy && row.mountedBy.length > 0) {
              text = i18n.t('k8s.text_302')
              className = 'error-color'
            }
            return [<div class={className}>{text}</div>]
          },
        },
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true, width: 40 }),
    ]
  },
}
