<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

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
        },
        {
          title: this.$t('compute.target_name'),
          field: 'target',
        },
        {
          title: this.$t('compute.target_ip'),
          field: 'target_ips',
        },
        {
          title: this.$t('compute.target_mac'),
          field: 'mac_addr',
        },
        {
          title: this.$t('compute.flow_count'),
          field: 'flow_count',
        },
      ],
    }
  },
}
</script>
