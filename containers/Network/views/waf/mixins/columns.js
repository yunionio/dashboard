// import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getRegionTableColumn,
  getProjectDomainTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
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
        edit: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row, '')}>{row.name}</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'waf_instances', columns: () => this.columns, tipName: this.$t('network.waf') }),
      getStatusTableColumn({ statusModule: 'waf' }),
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
