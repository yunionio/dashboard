<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="sslCertificate" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getBrandTableColumn,
  getAccountTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'SslCertificateDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
        getAccountTableColumn(),
        getProjectTableColumn(),
        {
          field: 'issuer',
          title: this.$t('network.ssl_certificate.issuer'),
        },
        {
          field: 'sans',
          title: this.$t('network.ssl_certificate.sans'),
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
        getTimeTableColumn({ field: 'start_date', title: this.$t('network.ssl_certificate.start_date') }),
        getTimeTableColumn({ field: 'end_date', title: this.$t('network.ssl_certificate.end_date') }),
      ],
    }
  },
  computed: {
  },
}
</script>
