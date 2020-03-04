<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import ListMixin from '@/mixins/list'
import { getAccountFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RouteTableList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
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
        ],
      },
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
