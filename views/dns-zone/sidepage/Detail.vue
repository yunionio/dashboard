<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="dns_zones"
    statusModule="dnszone"
    :hiddenKeys="['tenant']"
    :nameProps="{edit: false}" />
</template>

<script>
import {
  getZoneTypeTableColumns,
} from '../utils/columns'

export default {
  name: 'DnsZoneDetail',
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
        getZoneTypeTableColumns(),
        {
          field: 'dns_recordset_count',
          title: this.$t('network.text_718'),
          formatter: ({ row }) => {
            return <a onClick={ () => this.$emit('tab-change', 'dns-recordset-list-for-dns-zone-sidepage') }>{row.dns_recordset_count}</a>
          },
        },
        {
          field: 'vpc_count',
          title: this.$t('network.text_719'),
          formatter: ({ row }) => {
            return <a onClick={ () => this.$emit('tab-change', 'dns-associate-vpc-list') }>{row.vpc_count}</a>
          },
        },
      ],
    }
  },
}
</script>
