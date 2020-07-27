import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: i18n.t('network.text_317'),
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'common_name',
        title: i18n.t('network.text_318'),
        width: 150,
        formatter: ({ cellValue }) => {
          return cellValue || '-'
        },
      },
      {
        field: 'not_after',
        title: i18n.t('network.text_319'),
        width: 150,
        formatter: ({ cellValue }) => {
          return cellValue ? this.$moment(cellValue).format(i18n.t('network.text_36')) : '-'
        },
      },
      {
        field: 'subject_alternative_names',
        title: i18n.t('network.text_320'),
        width: 150,
        formatter: ({ cellValue }) => {
          return cellValue || '-'
        },
      },
      getProjectTableColumn(),
    ]
  },
}
