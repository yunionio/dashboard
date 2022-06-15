import {
  getNameDescriptionTableColumn,
  getTimeTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('compute.text_210') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn(),
      {
        title: i18n.t('compute.text_175'),
        field: 'type',
      },
      {
        title: i18n.t('compute.target_name'),
        field: 'target',
      },
      {
        title: i18n.t('compute.target_ip'),
        field: 'target_ips',
      },
      {
        title: i18n.t('compute.target_mac'),
        field: 'mac_addr',
      },
      {
        title: i18n.t('compute.flow_count'),
        field: 'flow_count',
      },
      getTimeTableColumn(),
    ]
  },
}
