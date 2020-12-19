<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
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
  },
  data () {
    return {
      list: this.$list.createList(this, {
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
        },
      }),
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
