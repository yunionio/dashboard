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
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'AnsiblePlaybookList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ansibleplaybooks',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: this.$t('compute.text_228'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: {
            label: this.$t('compute.text_229'),
            dropdown: true,
            multiple: true,
            items: (function (t) {
              const _items = []
              const statusItems = t.$t('status.ansiblePlaybook')
              for (const key in statusItems) {
                _items.push({
                  key,
                  label: statusItems[key],
                })
              }
              return _items
            })(this),
            filter: true,
            formatter: val => {
              return `status.in(${val.join(',')})`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_229'), key: 'status' },
          { label: this.$t('compute.text_230'), key: 'start_time' },
          { label: this.$t('compute.text_231'), key: 'end_time' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
        ],
      },
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AnsiblePlaybookSidepage', {
        id: row.id,
        resource: 'ansibleplaybooks',
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
