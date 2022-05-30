import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
        formRules: [{
          required: true,
          message: i18n.t('system.text_168'),
          whitespace: true,
        }],
      }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
