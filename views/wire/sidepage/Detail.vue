<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="wires" />
</template>

<script>
import { getBandwidthTableColumn } from '../utils/columns'
import { getBrandTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'WireDetail',
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
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
        getBandwidthTableColumn(),
        getCopyWithContentTableColumn({
          field: 'vpc',
          title: 'VPC',
          hideField: true,
          slotCallback: row => {
            if (!row.vpc) return '-'
            return [
              <side-page-trigger permission='vpcs_get' name='VpcSidePage' id={row.vpc_id} vm={this}>{ row.vpc }</side-page-trigger>,
            ]
          },
        }),
        {
          field: 'networks',
          title: '网络数量',
          slots: {
            default: ({ row }, h) => {
              return [
                <p>{ row.networks }<span style={{ color: '#aaa' }}>（IP子网数量）</span></p>,
              ]
            },
          },
        },
        getCopyWithContentTableColumn({
          field: 'region',
          title: '区域',
          hideField: true,
          slotCallback: row => {
            if (!row.region) return '-'
            return [
              <side-page-trigger permission='areas_get' name='CloudregionSidePage' id={row.region_id} vm={this}>{ row.region }</side-page-trigger>,
            ]
          },
        }),
      ],
      extraInfo: [],
    }
  },
}
</script>
