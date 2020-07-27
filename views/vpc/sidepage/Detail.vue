<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="vpcs"
    statusModule="vpc" />
</template>

<script>
import {
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'VPCDetail',
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
        {
          field: 'cidr_block',
          title: this.$t('network.text_244'),
        },
        {
          field: 'wire_count',
          title: this.$t('network.text_691'),
        },
        {
          field: 'routetable_count',
          title: this.$t('network.text_692'),
        },
        {
          field: 'network_count',
          title: this.$t('network.text_682'),
          slots: {
            default: ({ row }) => {
              if (!row.network_count) return '-'
              return [<a onClick={ () => this.$emit('tab-change', 'network-list') }>{row.network_count}</a>]
            },
          },
        },
        {
          field: 'natgateway_count',
          title: this.$t('network.text_693'),
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
