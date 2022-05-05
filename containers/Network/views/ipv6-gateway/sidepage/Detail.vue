<template>
  <detail
    :on-manager="onManager"
    :data="data"
    statusModule="ipv6_gateway"
    resource="ipv6_gatewayss"
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
        {
          field: 'vpc',
          title: 'VPC',
        },
        {
          field: 'instance_type',
          title: this.$t('network.text_268'),
        },
        getBrandTableColumn(),
        getCopyWithContentTableColumn({
          field: 'region',
          title: this.$t('network.text_199'),
          hideField: true,
          slotCallback: row => {
            if (!row.region) return '-'
            return [
              <side-page-trigger permission='areas_get' name='CloudregionSidePage' id={row.region_id} vm={this}>{ row.region }</side-page-trigger>,
            ]
          },
        }),
        {
          field: 'zone',
          title: this.$t('network.text_199'),
          slots: {
            default: ({ row }) => {
              if (row.zone_1) {
                const ret = [<div>{ row.zone }({this.$t('db.text_165')})</div>]
                ret.push(
                  <div>
                    {row.zone_1_name}({this.$t('db.text_164')})
                  </div>,
                )
                return ret
              }
              return row.zone || '-'
            },
          },
        },
      ],
    }
  },
}
</script>
