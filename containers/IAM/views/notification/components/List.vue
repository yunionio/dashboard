<template>
  <notification-base-list :extra-list-params="ExtraListParams" :extra-columns="ExtraColumns" :extra-filter-options="ExtraFilterOptions" :id="id" />
</template>

<script>
import NotificationBaseList from '@IAM/sections/NotificationBaseList'
import { getTimeRangeFilter } from '@/utils/common/tableFilter'
import { getTimeTableColumn } from '@/utils/common/tableColumn'
import { NOTIFY_TOPIC_TYPES_MAP } from '@IAM/constants'

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
        {
          title: this.$t('system.notify.topic.type'),
          field: 'type',
          sortable: true,
          minWidth: 100,
          showOverflow: 'title',
          formatter: ({ row }) => {
            return NOTIFY_TOPIC_TYPES_MAP[row.type] ? NOTIFY_TOPIC_TYPES_MAP[row.type].label : '-'
          },
        },
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
        type: {
          label: this.$t('system.text_48'),
          filter: true,
          dropdown: true,
          distinctField: {
            type: 'field',
            key: 'topic_type',
            getParams: this.getParam,
          },
          formatter: val => {
            return `topic_type.contains("${val}")`
          },
          mapper: list => {
            return list.map(({ key, label }) => {
              return {
                key,
                label: NOTIFY_TOPIC_TYPES_MAP[key] ? NOTIFY_TOPIC_TYPES_MAP[key].label : label,
              }
            })
          },
        },
        received_at: getTimeRangeFilter({ label: this.$t('system.text_316'), field: 'received_at' }),
      },
    }
  },
}
</script>
