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
        field: 'value',
        title: i18n.t('k8s.vc_priority_value'),
        width: 120,
      },
      {
        field: 'globalDefault',
        title: i18n.t('k8s.vc_global_default'),
        width: 110,
        formatter: ({ row }) => row.globalDefault ? i18n.t('k8s.vc_yes') : i18n.t('k8s.vc_no'),
      },
      {
        field: 'description',
        title: i18n.t('k8s.vc_description'),
        minWidth: 160,
        formatter: ({ row }) => row.description || '-',
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
