import {
  getDefaultStrategyTableColumn,
  getResourceTypeTableColumn,
  getResourceCountTableColumn,
  getDynamicSchedtagCountTableColumn,
  getSchedpolicyCountTableColumn,
} from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
        formRules: [
          { required: true, message: this.$t('cloudenv.text_190') },
        ],
      }),
      getTagTableColumn({
        onManager: this.onManager,
        needExt: true,
        resource: 'schedtags',
        columns: () => this.columns,
        tipName: this.$t('dictionary.schedtag'),
      }),
      getDefaultStrategyTableColumn(),
      getResourceTypeTableColumn(),
      getResourceCountTableColumn(),
      getDynamicSchedtagCountTableColumn(),
      getSchedpolicyCountTableColumn(),
      {
        field: 'scope',
        title: this.$t('table.title.scope_range'),
        minWidth: 120,
        formatter: ({ row }) => {
          let ret = this.$t('cloudenv.text_504')
          if (row.project_domain) {
            ret = this.$t('cloudenv.text_505', [row.project_domain])
          }
          if (row.project) {
            ret = this.$t('cloudenv.text_506', [row.project])
          }
          return ret
        },
      },
    ]
  },
}
