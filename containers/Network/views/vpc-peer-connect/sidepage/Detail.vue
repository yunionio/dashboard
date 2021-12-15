<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="vpc_peering_connections"
    statusModule="vpcPeerConnect"
    :hiddenKeys="['tenant', 'project_domain', 'region', 'zone']" />
</template>

<script>
import {
  getBrandTableColumn,
  getDomainColumn,
} from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import {
  getVpcTableColumn,
  getPeerVpcTableColumn,
  getExtPeerAccountTableColumn,
} from '../utils/column'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'vpcPeerConnectDetail',
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
        getUserTagColumn({ onManager: this.onManager, resource: 'vpc_peering_connections', columns: () => this.columns, tipName: this.$t('dictionary.vpc_peer_connect') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'vpc_peering_connections', columns: () => this.columns, tipName: this.$t('dictionary.vpc_peer_connect') }),
        getDomainColumn({ vm: this }),
        getBrandTableColumn(),
      ],
      extraInfo: [
        {
          title: this.$t('network.text_308'),
          items: [
            getVpcTableColumn(this),
            getPeerVpcTableColumn(),
            getExtPeerAccountTableColumn(),
          ],
        },
      ],
    }
  },
}
</script>
