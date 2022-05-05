import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
  getBrandTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: i18n.t('network.text_21'),
        edit: false,
        editDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'ipv6_gateway', title: i18n.t('network.text_27') }),
      {
        field: 'vpc',
        title: 'VPC',
        minWidth: 100,
        formatter: ({ row }) => {
          return row.vpc || '-'
        },
        hidden: this.$store.getters.isProjectMode,
      },
      {
        field: 'instance_type',
        title: i18n.t('network.text_268'),
      },
      getBrandTableColumn(),
      {
        field: 'account',
        title: i18n.t('network.text_196'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            const ret = []
            ret.push(
              <list-body-cell-wrap hide-field copy field='account' row={row}>
                <span style={{ color: '#0A1F44' }}>{row.account}</span>
              </list-body-cell-wrap>,
            )
            if (row.manager) {
              ret.push(
                <list-body-cell-wrap hide-field copy field='manager' row={row}>
                  <span style={{ color: '#53627C' }}>{row.manager}</span>
                </list-body-cell-wrap>,
              )
            }
            return ret
          },
        },
        hidden: this.$store.getters.isProjectMode,
      },
      getProjectTableColumn(),
      getRegionTableColumn({ showOverflow: false }),
      getTimeTableColumn(),
    ]
  },
}
