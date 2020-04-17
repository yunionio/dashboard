<template>
  <detail :base-info="baseInfo" :data="data" statusModule="rdsDatabase" />
</template>

<script>
import { RDS_ACCOUNT_PRIVILEGES } from '@DB/constants'

export default {
  name: 'RDSDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'dbinstanceprivileges',
          title: '已授权的账户',
          slots: {
            default: ({ row }) => {
              if (row.dbinstanceprivileges && row.dbinstanceprivileges.length > 0) {
                return row.dbinstanceprivileges.map(({ account, privileges }) => {
                  return <div>{account} <span style="color:#666;margin:0 0 0 3px">({RDS_ACCOUNT_PRIVILEGES[privileges]})</span></div>
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
