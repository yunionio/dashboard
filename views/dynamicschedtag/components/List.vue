<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import { ENABLED_OPTS } from '@/constants'
import ListMixin from '@/mixins/list'

export default {
  name: 'DynamicschedtagList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dynamicschedtags',
        getParams: { details: true },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains('${val}')`
            },
          },
          enabled: {
            label: '启用状态',
            dropdown: true,
            multiple: true,
            items: ENABLED_OPTS,
          },
          schedpolicies: {
            label: '调度标签',
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `schedtags.id(schedtag_id).name.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '启用状态', key: 'enabled' },
          { label: '调度标签', key: 'schedtag' },
          { label: '条件', key: 'condition' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('CreateDynamicschedtagDialog', {
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除动态调度标签',
              name: this.$t('dictionary.dynamicschedtag'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('dynamicschedtag-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DynamicschedtagSidePage', {
        id: row.id,
        resource: 'dynamicschedtags',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
