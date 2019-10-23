<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import {
  getProjectTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
export default {
  name: 'CloudproviderDetail',
  props: {
    list: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn({ field: 'provider' }),
        {
          field: 'account',
          title: '账号',
        },
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'cloudaccount' }),
        {
          field: 'last_sync',
          title: '同步时间',
          formatter: ({ row }) => {
            return this.$moment(row.last_sync).format()
          },
        },
        getProjectTableColumn(),
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: '健康状态', field: 'health_status' }),
          ],
        },
      ],
    }
  },
}
</script>
