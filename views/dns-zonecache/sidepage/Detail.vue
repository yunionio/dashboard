<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="dns_zonecaches"
    :hiddenKeys="['tenant', 'project_domain', 'status']"
    :nameProps="{edit: false}" />
</template>

<script>
import {
  getBrandTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'DnsZonecacheDetail',
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
      ],
    }
  },
}
</script>
