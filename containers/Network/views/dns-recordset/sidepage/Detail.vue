<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="dnsrecords"
    :hiddenKeys="['tenant', 'project_domain', 'status']"
    :nameProps="{edit: false}" />
</template>

<script>
import {
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import {
  getDnsTypeTableColumns,
  getDnsValueTableColumns,
  getTtlTableColumns,
  getTrafficPoliciesTableColumns,
} from '../utils/columns'
export default {
  name: 'DnsRecordSetDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    dnsZoneData: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      extraInfo: [],
    }
  },
  computed: {
    isCloudflare () {
      return this.dnsZoneData?.provider === 'Cloudflare'
    },
    baseInfo () {
      const baseInfo = [
        getDnsTypeTableColumns(),
        getDnsValueTableColumns(),
        getTtlTableColumns(),
        getTrafficPoliciesTableColumns(),
        getEnabledTableColumn(),
      ]
      if (this.isCloudflare) {
        baseInfo.push({
          field: 'proxied',
          title: this.$t('network.proxy_status'),
          formatter: ({ row }) => {
            return row.proxied ? this.$t('network.proxy_exist') : this.$t('network.just_dns')
          },
        })
        return baseInfo.filter(item => item.field !== 'traffic_policies')
      }
      return baseInfo
    },
  },
}
</script>
