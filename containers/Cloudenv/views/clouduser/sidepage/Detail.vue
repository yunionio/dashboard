<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    status-module="clouduser"
    :is-edit-name="false" />
</template>

<script>
import { getBrandTableColumn, getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'ClouduserDetail',
  props: {
    onManager: {
      type: Function,
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
        getBrandTableColumn(),
        {
          field: 'iam_login_url',
          title: this.$t('cloudenv.clouduser_list_t3'),
          slots: {
            default: ({ row }) => {
              if (!row.iam_login_url) return '-'
              return [<help-link href={ row.iam_login_url } />]
            },
          },
        },
        getCopyWithContentTableColumn({
          field: 'owner_name',
          title: this.$t('cloudenv.clouduser_list_t4'),
        }),
        getEnabledTableColumn({
          field: 'is_console_login',
          title: this.$t('cloudenv.clouduser_list_t5'),
        }),
      ],
    }
  },
}
</script>
