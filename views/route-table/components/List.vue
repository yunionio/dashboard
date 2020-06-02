<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getAccountFilter, getBrandFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'RouteTableList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'route_tables',
        getParams: { details: true },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          account: getAccountFilter(),
          vpc: {
            label: '所属专有网络',
          },
          region: {
            label: '区域',
          },
          brand: getBrandFilter(),
          project_domain: getProjectDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '所属专有网络', key: 'vpc' },
          { label: '区域', key: 'region' },
          { label: '云账号', key: 'manager' },
          { label: '条目（路由表类型 目标网段 下一跳）', key: 'routes' },
          { label: '共享范围', key: 'public_scope' },
          { label: `所属${this.$t('dictionary.domain')}`, key: 'project_domain' },
        ],
      },
      groupActions: [
        // {
        //   label: '同步状态',
        //   action: () => {
        //     this.onManager('batchPerformAction', {
        //       steadyStatus: ['running', 'ready'],
        //       managerArgs: {
        //         action: 'syncstatus',
        //       },
        //     })
        //   },
        //   meta: () => ({
        //     validate: this.list.selected.length,
        //   }),
        // },
        getDomainChangeOwnerAction(this, {
          name: this.$t('dictionary.route_table'),
          resource: 'route_tables',
        }),
        getSetPublicAction(this, {
          name: this.$t('dictionary.route_table'),
          scope: 'domain',
          resource: 'route_tables',
        }, {
          meta: () => {
            validate: this.list.selectedItems.length > 0,
          },
        }),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
