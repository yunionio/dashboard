import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        showDesc: false,
        edit: false,
        slotCallback: row => {
          return row.hostname
        },
      }),
      {
        field: 'min_tls_version',
        label: this.$t('network.cdn.min_tls_version'),
        formatter: ({ row }) => {
          return row.ssl?.settings?.min_tls_version ? `TLS ${row.ssl?.settings?.min_tls_version}` : '-'
        },
      },
      {
        field: 'certificate_type',
        label: this.$t('network.cdn.certificate_type'),
        formatter: ({ row }) => {
          return row.ssl?.type === 'dv' ? this.$t('network.cdn.certificate_type_cloudflare') : this.$t('network.cdn.certificate_type_custom')
        },
      },
      {
        field: 'custom_origin_server',
        label: this.$t('network.cdn.origin_server'),
        formatter: ({ row }) => {
          return row.custom_origin_server || this.$t('network.cdn.origin_server.default')
        },
      },
    ]
  },
}
