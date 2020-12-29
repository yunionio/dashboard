<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { levelMaps } from '@Monitor/constants'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'AlertrecordList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    getParams: {
      type: Object,
      default: () => ({}),
    },
    data: {
      type: Object,
      required: true,
    },
    listId: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'alertrecords',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
          level: {
            label: this.$t('monitor.level'),
            dropdown: true,
            items: Object.values(levelMaps),
          },
          state: {
            label: this.$t('common.status'),
            dropdown: true,
            items: [
              { label: this.$t('status.alertrecord.ok'), key: 'ok' },
              { label: this.$t('status.alertrecord.alerting'), key: 'alerting' },
            ],
          },
          res_type: {
            label: this.$t('monitor.text_97'),
            dropdown: true,
            distinctField: {
              type: 'extra_field',
              key: 'res_type',
            },
            mapper: data => {
              return data.map(val => {
                let label = val.label
                if (this.$te(`dictionary.${val.key}`)) label = this.$t(`dictionary.${val.key}`)
                return {
                  key: val.key,
                  label,
                }
              })
            },
          },
          created_at: {
            label: this.$t('monitor.text_14'),
            dropdown: true,
            date: true,
            filter: true,
            formatter: (val, type) => {
              if (type === 'before') {
                return `created_at.le("${val}")`
              }
              if (type === 'after') {
                return `created_at.ge("${val}")`
              }
              return `created_at.between("${val[0]}", "${val[1]}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { key: 'alert_name', label: this.$t('monitor.text_99') },
          { key: 'created_at', label: this.$t('monitor.text_14') },
          { key: 'res_type', label: this.$t('monitor.text_97') },
          { key: 'alert_rule', label: this.$t('monitor.strategy_detail') },
          { key: 'level', label: this.$t('monitor.level') },
          { key: 'res_num', label: this.$t('cloudenv.text_417') },
          { key: 'status', label: this.$t('common.status') },
        ],
      },
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CommonalertsSidePage', {
        id: row.alert_id,
        resource: 'commonalerts',
        apiVersion: 'v1',
      })
    },
  },
}
</script>
