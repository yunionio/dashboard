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
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VPCDetail',
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
    columns: Array,
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'vpc', columns: () => this.columns, tipName: this.$t('dictionary.vpc') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'vpc', columns: () => this.columns, tipName: this.$t('dictionary.vpc') }),
        getPublicScopeTableColumn({ vm: this, resource: 'vpcs' }),
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
