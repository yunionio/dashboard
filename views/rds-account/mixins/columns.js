import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { RDS_ACCOUNT_PRIVILEGES } from '@DB/constants'
import { getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        vm: this,
        onManager: this.onManager,
        hideField: true,
        edit: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'rdsAccount' }),
      {
        field: 'host',
        title: this.$t('db.text_344'),
        minWidth: 100,
      },
      {
        field: 'password',
        title: this.$t('db.text_195'),
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={row.id} resourceType='dbinstanceaccounts' />]
          },
        },
      },
      {
        field: 'dbinstanceprivileges',
        minWidth: 200,
        title: this.$t('db.text_196'),
        slots: {
          default: ({ row }) => {
            if (row.dbinstanceprivileges && row.dbinstanceprivileges.length > 0) {
              return row.dbinstanceprivileges.map(({ database, privileges }) => {
                return <div>{database} <span style="color:#666;margin:0 0 0 3px">({RDS_ACCOUNT_PRIVILEGES[privileges] ? RDS_ACCOUNT_PRIVILEGES[privileges] : privileges})</span></div>
              })
            }
            return '-'
          },
        },
      },
    ]
  },
}
