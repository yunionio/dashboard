import { getNameDescriptionTableColumn, getProjectTableColumn, getBrandTableColumn, getAccountTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        hideField: true,
        edit: false,
        onManager: this.onManager,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'ips',
        title: 'IP',
        formatter: ({ row }) => {
          if (row.access_ip) {
            return row.access_ip
          } else if (row.ips) {
            return row.ips
          }
          return '-'
        },
      },
      {
        field: 'status',
        title: this.$t('common.status'),
        slots: {
          default: ({ row }, h) => {
            let m = 'server'
            if (row.res_type) {
              if (row.res_type === 'guest') {
                m = 'server'
              } else if (row.res_type === 'storage') {
                m = 'blockstorage'
              } else {
                m = row.res_type
              }
            }
            return [
              <div class='text-truncate'>
                <status status={row.status} statusModule={m} />
              </div>,
            ]
          },
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn({ vm: this }),
      getProjectTableColumn({ title: this.$t('common_547', ['']) }),
    ]
    this.extandData = {}
  },
}
