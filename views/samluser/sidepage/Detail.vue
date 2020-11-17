<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    status-module="samluser"
    :is-edit-name="false" />
</template>

<script>
import { getBrandTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SamluserDetail',
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
      ],
    }
  },
}
</script>
