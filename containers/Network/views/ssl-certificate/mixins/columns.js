import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({
        statusModule: 'sslCertificate',
        vm: this,
      }),
      {
        field: 'issuer',
        label: this.$t('network.ssl_certificate.issuer'),
      },
      {
        field: 'sans',
        label: this.$t('network.ssl_certificate.sans'),
        slots: {
          default: ({ row }) => {
            if (!row.sans) return '-'
            const list = JSON.parse(row.sans).map(sans => {
              return (
                <div>{sans}</div>
              )
            })
            return [
              <div>
                {...list}
              </div>,
            ]
          },
        },
      },
      getTimeTableColumn(),
    ]
  },
}
