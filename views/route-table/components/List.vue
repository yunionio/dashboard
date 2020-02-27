<template>
  <page-list
    :list="list"
    :columns="columns" />
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
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
