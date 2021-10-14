<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :extraExportParams="ExtraListParams"
    default-search-key="topic" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NotificationBaseList',
  mixins: [WindowsMixin],
  props: {
    id: String,
    ExtraListParams: {
      type: Object,
    },
    ExtraColumns: {
      type: Array,
      required: false,
      default: () => ([]),
    },
    ExtraFilterOptions: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    ExtraExportDataOptions: {
      type: Array,
      required: false,
      default: () => ([]),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'notifications',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          // start_time.between('2020-11-04T16:00:00Z', '2020-11-06T15:59:59Z')
          topic: {
            label: this.$t('system.text_307'),
            filter: true,
            formatter: val => {
              return `topic.contains("${val}")`
            },
          },
          priority: {
            label: this.$t('system.text_315'),
            dropdown: true,
            filter: true,
            items: Object.keys(this.$t('notificationPriority')).map(key => {
              return {
                label: this.$t(`notificationPriority.${key}`),
                key,
              }
            }),
            formatter: val => {
              return `priority.contains("${val}")`
            },
          },
          ...this.ExtraFilterOptions,
        },
      }),
      exportDataOptions: {
        items: [
          { label: this.$t('system.text_307'), key: 'title' },
          { label: this.$t('system.text_315'), key: 'priority' },
          { label: this.$t('system.text_316'), key: 'received_at' },
          ...this.ExtraExportDataOptions,
        ],
      },
      columns: [
        getCopyWithContentTableColumn({
          title: this.$t('system.text_307'),
          field: 'title',
        }),
        {
          title: this.$t('system.text_315'),
          field: 'priority',
          width: 80,
          formatter: ({ cellValue }) => {
            return this.$t(`notificationPriority.${cellValue}`)
          },
        },
        {
          title: this.$t('system.text_317'),
          field: 'receive_details',
          type: 'expand',
          slots: {
            default: ({ row }) => {
              return row.receive_details && row.receive_details.length
            },
            content: ({ row }) => {
              return [
                <vxe-grid
                  size="mini"
                  data={ row.receive_details || [] }
                  columns={[
                    getCopyWithContentTableColumn({ title: this.$t('system.text_6'), field: 'receiver_name' }),
                    getTimeTableColumn({ title: this.$t('system.text_316'), field: 'sendAt' }),
                    getStatusTableColumn({ statusModule: 'notification', sortable: false }),
                  ]} />,
              ]
            },
          },
        },
        ...this.ExtraColumns,
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.ExtraListParams,
        details: true,
      }
      return ret
    },
  },
}
</script>
