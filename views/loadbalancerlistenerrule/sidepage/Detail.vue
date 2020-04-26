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
  name: 'LoadbalancerlistenerruleDetail',
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
          title: '其他信息',
          items: [
            getCopyWithContentTableColumn({
              field: 'loadbalancer',
              title: '负载均衡实例',
              hideField: true,
              slotCallback: row => {
                if (!row.loadbalancer) return '-'
                return [
                  <side-page-trigger permission='lb_loadbalancers_get' name='LbSidePage' id={row.loadbalancer_id} vm={this}>{ row.loadbalancer }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'domain',
              title: '域名',
            },
            {
              field: 'path',
              title: 'URL',
            },
            {
              field: 'backend_group',
              title: '后端服务器组',
            },
            {
              field: 'vpc',
              title: 'VPC',
            },
            {
              field: 'region',
              title: '区域',
            },
            {
              field: 'zone',
              title: '可用区',
            },
          ],
        },
      ],
    }
  },
}
</script>
