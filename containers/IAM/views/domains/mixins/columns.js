import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('system.text_168') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'domains', columns: () => this.columns, tipName: this.$t('dictionary.domain') }),
      getEnabledTableColumn(),
      {
        field: 'idp',
        title: this.$t('dictionary.identity_provider'),
        slots: {
          default: ({ row }) => {
            if (!row.idp) return '-'
            const text = row.idp
            return [
              <side-page-trigger name='IDPSidePage' tab='idp-detail' id={row.idp_id} vm={this}>{text}</side-page-trigger>,
            ]
          },
        },
      },
      getTimeTableColumn(),
    ]
  },
}
