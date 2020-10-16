import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: '请输入名称' },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name_cn ? `${row.name}(${row.name_cn})` : row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'wires',
        title: i18n.t('cloudenv.text_229'),
        width: 70,
      },
      {
        field: 'hosts',
        title: i18n.t('cloudenv.text_483'),
        width: 140,
        formatter: ({ row }) => {
          return `${row.hosts}/${row.hosts_enabled}`
        },
      },
      {
        field: 'baremetals',
        title: i18n.t('cloudenv.text_484'),
        width: 180,
        formatter: ({ row }) => {
          return `${row.baremetals}/${row.baremetals_enabled}`
        },
      },
    ]
  },
}
