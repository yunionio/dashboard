<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'DiskListForVmSnapshotPolicySidePage',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'disks',
        steadyStatus: Object.values(expectStatus.disk).flat(),
        getParams: { ...this.getParams, 'filter.0': 'disk_type.notin(volume)', snapshotpolicy_id: this.resId },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
        {
          field: 'disk_size',
          title: '容量',
          minWidth: 50,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'disk' }),
        {
          field: 'disk_type',
          title: '磁盘类型',
          width: 70,
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? '系统盘' : '数据盘'
          },
        },
        getRegionTableColumn(),
        {
          field: 'guest',
          title: '主机',
          minWidth: 100,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate'>
                  {row.guest}
                  {row.guest_status ? <status status={ row['guest_status'] } statusModule='server'/> : ''}
                </div>,
              ]
            },
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
