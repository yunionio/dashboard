<template>
  <page-list
    :list="list"
    :columns="columns"
    show-sync
    :export-data-options="exportDataOptions"
    :placeholder="this.$t('common.text00014')" />
</template>

<script>
import {
  getTimeRangeFilter,
} from '@/utils/common/tableFilter'
import {
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'BillSyncForCloudaccountSidepage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    resId: String,
    data: Object,
    getParams: [Function, Object],
  },
  data () {
    return {
      columns: [
        {
          field: 'type',
          title: this.$t('cloudenv.text_425'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return this.$t('cloudenv.bill_sync')
            },
          },
        },
        getStatusTableColumn({ statusModule: 'scheduledtaskBillSync', minWidth: 90 }),
        {
          field: 'created_at',
          title: this.$t('cloudenv.text_461'),
          minWidth: 200,
          showOverflow: 'title',
          formatter: ({ row }) => {
            return row.created_at ? this.$moment(row.created_at).format('YYYY-MM-DD hh:mm:ss') : '-'
          },
        },
        {
          field: 'updated_at',
          title: this.$t('cloudenv.text_462'),
          minWidth: 200,
          showOverflow: 'title',
          formatter: ({ row }) => {
            return row.updated_at ? this.$moment(row.updated_at).format('YYYY-MM-DD hh:mm:ss') : '-'
          },
        },
      ],
      list: this.$list.createList(this, {
        id: this.id,
        apiVersion: 'v1',
        resource: 'progresses',
        getParams: this.getParam,
        filterOptions: {
          created_at: getTimeRangeFilter({ label: this.$t('cloudenv.text_461'), field: 'created_at' }),
          updated_at: getTimeRangeFilter({ label: this.$t('cloudenv.text_462'), field: 'updated_at' }),
        },
      }),
      exportDataOptions: {
        items: [
          { label: this.$t('cloudenv.text_425'), key: 'type' },
          { label: this.$t('cloudenv.text_98'), key: 'status' },
          { label: this.$t('cloudenv.text_461'), key: 'created_at' },
          { label: this.$t('cloudenv.text_462'), key: 'updated_at' },
        ],
      },
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    refresh () {
      this.list.fetchData()
    },
    getParam () {
      const ret = {
        details: true,
        type: 'pull',
        account_id: this.resId,
      }
      return ret
    },
  },
}
</script>
