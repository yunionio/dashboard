<template>
  <detail
    statusModule="rdsAccount"
    :base-info="baseInfo"
    :data="data"
    :on-manager="onManager"
    :is-edit-name="false" />
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
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'dbinstanceprivileges',
          title: this.$t('db.text_194'),
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
