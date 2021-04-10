<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'

export default {
  name: 'LoadbalancerclusterDetail',
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
        getUserTagColumn({ onManager: this.onManager, resource: 'loadbalancercluster', columns: () => this.columns, tipName: this.$t('network.text_19') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'loadbalancercluster', columns: () => this.columns, tipName: this.$t('network.text_19') }),
        {
          field: 'zone',
          title: this.$t('network.text_24'),
          formatter: ({ row }) => {
            return `${row.region} ${row.zone}`
          },
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
