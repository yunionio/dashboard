import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        resource: this.list.resource,
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getCopyWithContentTableColumn({ field: 'public_key', title: i18n.t('compute.text_725') }),
      getCopyWithContentTableColumn({ field: 'fingerprint', title: i18n.t('compute.text_726') }),
      {
        field: 'scheme',
        title: i18n.t('compute.text_175'),
      },
      {
        field: 'linked_guest_count',
        title: this.$t('compute.text_699', [this.$t('dictionary.server')]),
        width: 120,
        slots: {
          default: ({ row }, h) => {
            if (this.isPreLoad && row.linked_guest_count === undefined) return [<data-loading />]
            return `${row.linked_guest_count}`
          },
        },
      },
      getTimeTableColumn(),
    ]
  },
}
