<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import { getNameFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'CloudregionList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudregions',
        getParams: { cloud_env: 'private_or_onpremise' },
        filterOptions: {
          name: getNameFilter(),
          enabled: getEnabledFilter({ label: '状态' }),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '状态', key: 'status' },
          { label: '云服务器', key: 'guest_count' },
          { label: 'VPC', key: 'vpc_count' },
          { label: '可用区', key: 'zone_count' },
          { label: '平台', key: 'provider' },
        ],
      },
    }
  },
  created () {
    this.initSidePageTab('cloudregion-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CloudregionSidePage', {
        id: row.id,
        resource: 'cloudregions',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
