import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('system.text_168') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'projects', columns: () => this.columns, tipName: this.$t('dictionary.project') }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
