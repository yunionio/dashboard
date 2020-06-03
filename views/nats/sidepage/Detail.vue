<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="nat" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

const BillingType = {
  'postpaid': '后付费',
  'prepaid': '预付费',
}

export default {
  name: 'NatDetail',
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
        getCopyWithContentTableColumn({ field: 'vpc', title: '所属VPC' }),
        {
          field: 'region',
          title: '区域',
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'manager_project',
              title: '项目',
              formatter: ({ cellValue }) => {
                return cellValue || '-'
              },
            },
            {
              field: 'billing_type',
              title: '付费类型',
              formatter: ({ cellValue }) => {
                return BillingType[cellValue]
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
