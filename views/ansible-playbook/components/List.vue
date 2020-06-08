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
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: {
            label: '上一次执行状态',
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
          { label: '名称', key: 'name' },
          { label: '上一次执行状态', key: 'status' },
          { label: '开始时间', key: 'start_time' },
          { label: '结束时间', key: 'end_time' },
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
