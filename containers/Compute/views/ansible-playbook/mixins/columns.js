import { getStatusTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        isNameEdit: false,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'ansiblePlaybook', title: i18n.t('compute.text_229') }),
      getTimeTableColumn({
        field: 'start_time',
        title: i18n.t('compute.text_230'),
      }),
      getTimeTableColumn({
        field: 'end_time',
        title: i18n.t('compute.text_231'),
      }),
      getProjectTableColumn(),
    ]
  },
}
