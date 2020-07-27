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
  name: 'LoadbalancerbackendDetail',
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
              field: 'address',
              title: this.$t('network.text_213'),
            },
            {
              field: 'port',
              title: this.$t('network.text_165'),
            },
            {
              field: 'weight',
              title: this.$t('network.text_166'),
            },
            {
              field: 'vpc',
              title: 'VPC',
            },
            {
              field: 'zone',
              title: this.$t('network.text_24'),
            },
            {
              field: 'ssl',
              title: this.$t('network.text_143'),
            },
          ],
        },
      ],
    }
  },
}
</script>
