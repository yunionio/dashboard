<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import { getCopyWithContentTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LoadbalancerbackendgroupDetail',
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
      ],
      extraInfo: [
        {
          title: this.$t('network.text_38'),
          items: [
            getCopyWithContentTableColumn({
              field: 'loadbalancer',
              title: this.$t('network.text_137'),
              hideField: true,
              slotCallback: row => {
                if (!row.loadbalancer) return '-'
                return [
                  <side-page-trigger permission='lb_loadbalancers_get' name='LbSidePage' id={row.loadbalancer_id} vm={this}>{ row.loadbalancer }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'vpc',
              title: 'VPC',
            },
            {
              field: 'cloudregion',
              title: this.$t('network.text_199'),
            },
            {
              field: 'zone',
              title: this.$t('network.text_24'),
            },
            {
              field: 'loadbalancer_health_check',
              title: this.$t('network.health_check'),
              formatter: ({ row }) => {
                return row.loadbalancer_health_check || '-'
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
