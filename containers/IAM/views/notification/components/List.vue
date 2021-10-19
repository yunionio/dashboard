<template>
  <notification-base-list :extra-list-params="ExtraListParams" :extra-columns="ExtraColumns" :extra-filter-options="ExtraFilterOptions" :id="id" />
</template>

<script>
import NotificationBaseList from '@IAM/sections/NotificationBaseList'
import { getTimeRangeFilter } from '@/utils/common/tableFilter'
import { getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'NotificationList',
  components: {
    NotificationBaseList,
  },
  props: {
    id: String,
  },
  data () {
    return {
      ExtraListParams: { contact_type: 'webconsole' },
      ExtraColumns: [
        getTimeTableColumn({
          field: 'received_at',
          title: this.$t('system.text_316'),
        }),
        {
          title: this.$t('system.text_308'),
          field: 'content',
        },
      ],
      ExtraFilterOptions: {
        received_at: getTimeRangeFilter({ label: this.$t('system.text_316'), field: 'received_at' }),
      },
    }
  },
}
</script>
