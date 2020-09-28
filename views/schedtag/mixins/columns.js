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
    ]
  },
}
