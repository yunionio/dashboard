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
import { getStatusFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'InstanceGroupList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'instancegroups',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          status: getStatusFilter('instanceGroup'),
          force_dispersion: {
            label: '策略',
            dropdown: true,
            items: [
              { label: '强制', key: true },
              { label: '非强制', key: false },
            ],
          },
          enabled: {
            label: '启用状态',
            dropdown: true,
            items: [
              { label: '启用', key: true },
              { label: '禁用', key: false },
            ],
          },
          tenant: {
            label: this.$t('dictionary.project'),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '启用状态', key: 'enabled' },
          { label: '名称', key: 'name' },
          { label: '策略', key: 'force_dispersion' },
          { label: '粒度', key: 'granularity' },
          { label: `绑定${this.$t('dictionary.server')}数量`, key: 'guest_count' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '创建时间', key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('InstanceGroupCreateDialog', {
              onManager: this.onManager,
              refresh: this.refresh,
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
              title: '删除主机组',
              name: this.$t('dictionary.instancegroup'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('instance-group-detail')
    this.list.fetchData()
    this.$bus.$on('InstanceGroupListRefresh', () => {
      this.list.refresh()
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        ...this.getParams,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'InstanceGroupSidePage', {
        id: row.id,
        resource: 'instancegroups',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
