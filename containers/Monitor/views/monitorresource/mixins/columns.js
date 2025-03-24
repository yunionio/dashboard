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
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row, '')}>{ row.name }</side-page-trigger>
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
        field: 'alert_state',
        title: this.$t('monitor.monitorresources.alert_state'),
        sortable: true,
        slots: {
          default: ({ row }, h) => {
            return [
              <div class='text-truncate'>
                <status status={row.alert_state} statusModule="monitorresources" />
              </div>,
            ]
          },
        },
      },
      {
        field: 'status',
        title: this.$t('common.status'),
        sortable: true,
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
      getProjectTableColumn({ vm: this, title: this.$t('common_547', ['']) }),
    ]
    this.extandData = {}
  },
}
