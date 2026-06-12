<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="ai_proxy_nodes" />
</template>

<script>
import { getEnabledTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'AiProxyNodeDetail',
  props: {
    data: { type: Object, required: true },
    onManager: { type: Function, required: true },
  },
  data () {
    return {
      baseInfo: [
        getEnabledTableColumn(),
        { field: 'address', title: this.$t('aice.aiproxy.address') },
        { field: 'access_address', title: this.$t('aice.aiproxy.access_address') },
        {
          field: 'is_active',
          title: this.$t('aice.aiproxy.is_active'),
          formatter: ({ row }) => row.is_active ? this.$t('common.true') : this.$t('common.false'),
        },
        { field: 'last_seen', title: this.$t('aice.aiproxy.last_seen') },
        { field: 'hb_timeout', title: this.$t('aice.aiproxy.hb_timeout') },
        getTimeTableColumn(),
      ],
    }
  },
}
</script>
