import {
  getDnsTypeTableColumns,
  getDnsValueTableColumns,
  getTrafficPoliciesTableColumns,
  getTtlTableColumns,
} from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: i18n.t('common_664'),
        edit: false,
        formRules: function (row) {
          return [
            { required: true, message: i18n.t('network.text_173') },
          ]
        },
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getDnsTypeTableColumns(),
      getDnsValueTableColumns(),
      getTrafficPoliciesTableColumns(),
      getTtlTableColumns(),
      getEnabledTableColumn(),
    ]
  },
}
