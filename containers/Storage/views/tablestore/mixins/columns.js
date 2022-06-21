import { getNameDescriptionTableColumn, getStatusTableColumn, getBrandTableColumn, getRegionTableColumn, getAccountTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
// import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        editDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'tablestore' }),
      // {
      //   field: 'spec',
      //   title: i18n.t('storage.spec'),
      //   width: 120,
      //   formatter: ({ row }) => {
      //     return row.spec || '-'
      //   },
      // },
      // {
      //   field: 'acl',
      //   title: i18n.t('storage.instance_model'),
      //   width: 120,
      //   formatter: ({ row }) => {
      //     return row.acl || '-'
      //   },
      // },
      getBrandTableColumn(),
      getAccountTableColumn(),
      getProjectTableColumn(),
      getRegionTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
