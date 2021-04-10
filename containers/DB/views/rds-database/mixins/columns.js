import { RDS_ACCOUNT_PRIVILEGES } from '@DB/constants'
import { getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'rdsDatabase' }),
      {
        field: 'dbinstanceprivileges',
        title: i18n.t('db.text_235'),
        minWidth: 200,
        slots: {
          default: ({ row }) => {
            if (row.dbinstanceprivileges && row.dbinstanceprivileges.length > 0) {
              return row.dbinstanceprivileges.map(({ account, privileges }) => {
                return <div>{account} <span style="color:#666;margin:0 0 0 3px">({RDS_ACCOUNT_PRIVILEGES[privileges] ? RDS_ACCOUNT_PRIVILEGES[privileges] : privileges })</span></div>
              })
            }
          },
        },
      },
    ]
  },
}
