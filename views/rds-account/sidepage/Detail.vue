<template>
  <detail :base-info="baseInfo" :data="data" />
</template>

<script>
import { RDS_ACCOUNT_PRIVILEGES } from '@DB/constants'

export default {
  name: 'RDSDetail',
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
        {
          field: 'name',
          title: '名称',
        },
        {
          field: 'status',
          title: '状态',
          slots: {
            default: ({ row }) => {
              return <status status={row.status} statusModule='rdsAccount' />
            },
          },
        },
        {
          field: 'dbinstanceprivileges',
          title: '已授权的数据库',
          slots: {
            default: ({ row }) => {
              if (row.dbinstanceprivileges && row.dbinstanceprivileges.length > 0) {
                return row.dbinstanceprivileges.map(({ database, privileges }) => {
                  return <div>{database} <span style="color:#666;margin:0 0 0 3px">({RDS_ACCOUNT_PRIVILEGES[privileges]})</span></div>
                })
              }
              return '-'
            },
          },
        },
      ],
    }
  },
}
</script>
