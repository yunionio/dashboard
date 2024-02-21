import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getProjectTableColumn,
  getPublicScopeTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
  getStatusTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: i18n.t('network.text_317'),
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, resource: 'lb_loadbalancercertificates', columns: () => this.columns }),
      getStatusTableColumn({ statusModule: 'lbcert', vm: this }),
      {
        field: 'common_name',
        title: i18n.t('network.text_318'),
        width: 150,
        slots: {
          default: ({ row }) => {
            if (row.common_name) return row.common_name
            return [<div slot="label"><span class="mr-1"> - </span></div>]
          },
        },
      },
      {
        field: 'not_after',
        title: i18n.t('network.text_319'),
        sortable: true,
        width: 150,
        slots: {
          default: ({ row }) => {
            if (row.not_after) {
              if (this.$moment().isAfter(this.$moment(row.not_after))) {
                return [
                  <span style="color: red">{this.$moment(row.not_after).format(i18n.t('network.text_36'))}</span>,
                ]
              }
              return [
                <span>{this.$moment(row.not_after).format(i18n.t('network.text_36'))}</span>,
              ]
            }
            return '-'
          },
        },
      },
      {
        field: 'subject_alternative_names',
        title: i18n.t('network.text_320'),
        width: 150,
        formatter: ({ cellValue }) => {
          return cellValue || '-'
        },
      },
      {
        field: 'lb_listener_count',
        title: this.$t('network.text_750'),
      },
      getPublicScopeTableColumn({ vm: this, resource: 'loadbalancercertificates' }),
      getProjectTableColumn(),
      getBrandTableColumn(),
      getAccountTableColumn(),
      getRegionTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
