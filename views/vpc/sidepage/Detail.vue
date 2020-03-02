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
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'VPCDetail',
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
        getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
        {
          field: 'cidr_block',
          title: '目标网段',
        },
        getBrandTableColumn(),
        getRegionTableColumn(),
        {
          field: 'wire_count',
          title: '二层网络数量',
        },
        {
          field: 'routetable_count',
          title: '路由表数量',
        },
        {
          field: 'network_count',
          title: 'IP子网数量',
        },
        {
          field: 'natgateway_count',
          title: 'nat网关数量',
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            getAccountTableColumn(),
            {
              field: 'manager',
              title: '子账号（订阅）',
            },
          ],
        },
      ],
    }
  },
}
</script>
