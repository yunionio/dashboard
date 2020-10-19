
<template>
  <page-list
    :list="list"
    :columns="columns"
    ref="pagelist"
    :expandConfig="expandConfig"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getTenantFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'AlertresourceList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    listId: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'alertresources',
        apiVersion: 'v1',
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('alertresource'),
          tenant: getTenantFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { key: 'name', label: this.$t('common.name') },
          { key: 'type', label: '资源类型' },
        ],
      },
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.list.fetchData()
    },
  },
}
</script>
