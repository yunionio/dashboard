<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SkuDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    cloudEnv: {
      type: String,
    },
  },
  data () {
    return {
      baseInfo: [
        getEnabledTableColumn(),
        {
          title: this.$t('compute.text_175'),
          field: 'type',
          formatter: ({ row }) => {
            if (row.type === 'host') {
              return this.$t('compute.host_port')
            }
            if (row.type === 'guest') {
              return this.$t('compute.guest_port')
            }
            return '-'
          },
        },
        {
          title: this.$t('compute.target_name'),
          field: 'target',
        },
        {
          title: this.$t('compute.target_ip'),
          field: 'target_ips',
          slots: {
            default: ({ row }) => {
              const { target_ips = '' } = row
              const ips = target_ips.split(',')
              return ips.map(ip => {
                return <list-body-cell-wrap copy field='ip' row={{ ip }} title={ip} />
              })
            },
          },
        },
        getCopyWithContentTableColumn({
          field: 'mac_addr',
          title: this.$t('compute.target_mac'),
          hideField: true,
          message: (row) => {
            return row.mac_addr
          },
          slotCallback: (row) => {
            return row.mac_addr
          },
        }),
        {
          title: this.$t('compute.flow_count'),
          field: 'flow_count',
        },
      ],
    }
  },
}
</script>
