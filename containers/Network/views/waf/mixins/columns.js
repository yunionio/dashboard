// import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getRegionTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'
// import VueI18n from 'vue-i18n'
import i18n from '@/locales'
// import { getTagColor, getTagTitle } from '@/utils/common/tag'
export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        showDesc: false,
        edit: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      {
        field: 'type',
        title: i18n.t('network.waf.type'),
      },
      getBrandTableColumn(),
      getAccountTableColumn(),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
