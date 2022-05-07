<template>
  <detail
    :on-manager="onManager"
    :data="data"
    statusModule="ipv6_gateway"
    resource="ipv6_gateways"
    :base-info="baseInfo" />
</template>

<script>
import { getBrandTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LbDetail',
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
        getCopyWithContentTableColumn({
          field: 'vpc',
          title: 'VPC',
          hideField: true,
          slotCallback: row => {
            if (!row.region) return '-'
            return [
              <side-page-trigger permission='vpcs_get' name='VpcSidePage' id={row.vpc_id} vm={this}>{ row.vpc }</side-page-trigger>,
            ]
          },
        }),
        {
          field: 'instance_type',
          title: this.$t('network.text_268'),
        },
        getBrandTableColumn(),
      ],
    }
  },
}
</script>
