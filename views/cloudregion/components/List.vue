<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions" />
</template>

<script>
import {
  getEnabledTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import { getNameFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudregionList',
  mixins: [WindowsMixin],
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
          { label: '专有网络(VPC)', key: 'vpc_count' },
          { label: '可用区', key: 'zone_count' },
          { label: '平台', key: 'provider' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'CloudregionSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getEnabledTableColumn({ title: '状态' }),
        {
          field: 'guest_count',
          title: '云服务器',
          width: 70,
        },
        {
          field: 'vpc_count',
          title: '专有网络(VPC)',
          width: 100,
        },
        {
          field: 'zone_count',
          title: '可用区',
          width: 70,
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('cloudregion-detail')
    this.list.fetchData()
  },
}
</script>
