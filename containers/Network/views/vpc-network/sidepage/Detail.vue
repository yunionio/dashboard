<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="inter_vpc_networks"
    statusModule="vpcNetwork"
    :hiddenKeys="['tenant', 'project_domain', 'region', 'zone']" />
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
  name: 'VpcNetworkDetail',
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
        getUserTagColumn({ onManager: this.onManager, resource: 'inter_vpc_networks', columns: () => this.columns, tipName: this.$t('dictionary.vpc_network') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'inter_vpc_networks', columns: () => this.columns, tipName: this.$t('dictionary.vpc_network') }),
        getPublicScopeTableColumn({ vm: this, resource: 'inter_vpc_networks' }),
        getBrandTableColumn(),
      ],
      extraInfo: [],
    }
  },
}
</script>
