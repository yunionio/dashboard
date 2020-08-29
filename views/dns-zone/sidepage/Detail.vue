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
  getVpcCountTableColumns,
  getDnsRecordsetCountTableColumns,

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
        getDnsRecordsetCountTableColumns(),
        getVpcCountTableColumns(),
      ],
    }
  },
}
</script>
