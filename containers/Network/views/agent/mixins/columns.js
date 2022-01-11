import {
  getNameDescriptionTableColumn,
  getTagTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        vm: this,
        hideField: true,
        title: i18n.t('network.text_21'),
        onManager: this.onManager,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'loadbalanceragent', columns: () => this.columns }),
      {
        field: 'ha_state',
        title: i18n.t('network.text_22'),
        width: 70,
      },
      {
        field: 'hb_last_seen',
        title: i18n.t('network.text_23'),
        width: 100,
        formatter: ({ cellValue }) => {
          return this.$moment(cellValue).fromNow()
        },
      },
      {
        field: 'ip',
        title: 'IP',
        width: 120,
      },
      {
        field: 'version',
        title: i18n.t('network.text_25'),
        width: 250,
      },
      {
        field: 'cluster',
        title: i18n.t('network.text_19'),
        showOverflow: 'ellipsis',
        minWidth: 100,
      },
      getRegionTableColumn(),
    ]
  },
}
