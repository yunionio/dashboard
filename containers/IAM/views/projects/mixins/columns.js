import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
  getCopyWithContentTableColumn,
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
      getTagTableColumn({ onManager: this.onManager, resource: 'projects', params: { service: 'identity', resource: 'projects' }, columns: () => this.columns, tipName: this.$t('dictionary.project') }),
      getCopyWithContentTableColumn({
        field: 'admin',
        title: i18n.t('iam.project_admin'),
        message: (row) => {
          return row.admin || '-'
        },
      }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
