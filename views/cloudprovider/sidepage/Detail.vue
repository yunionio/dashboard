<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="cloudaccount" />
</template>

<script>
import {
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
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ row } field='account' title={ row['account'] } />
                </div>,
              ]
            },
          },
        },
        getEnabledTableColumn(),
        {
          field: 'last_sync',
          title: '同步时间',
          formatter: ({ row }) => {
            return this.$moment(row.last_sync).format()
          },
        },
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
