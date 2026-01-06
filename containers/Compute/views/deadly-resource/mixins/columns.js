import {
  getNameDescriptionTableColumn,
  // getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getProjectDomainTableColumn,
  getBillingTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('common.tips.input', [i18n.t('table.title.name')]) },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      {
        field: 'resource_type',
        title: this.$t('common.resource_type'),
        sortable: true,
        formatter: ({ row }) => {
          return this.$getI18n(`res.${row.resource_type}`, row.resource_type)
        },
      },
      getBillingTableColumn({ vm: this, showSetButton: false }),
      getProjectDomainTableColumn({ vm: this }),
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
