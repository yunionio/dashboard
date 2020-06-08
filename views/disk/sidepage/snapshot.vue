<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'

const DISK_TYPES = {
  sys: '系统盘',
  data: '数据盘',
  'swap-swap': '分区',
}

export default {
  name: 'snapshotListSidepage',
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
        resource: 'snapshots',
        steadyStatus: Object.values(expectStatus.disk).flat(),
        getParams: { details: true, disk_id: this.resId },
        filterOptions: {
          name: {
            label: '快照名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          disk_name: {
            label: '硬盘',
            filter: true,
            formatter: val => {
              return `disk_name.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: '快照名称' }),
        {
          field: 'disk_name',
          title: '硬盘',
          minWidth: 50,
        },
        getBrandTableColumn(),
        {
          field: 'size',
          title: '容量',
          minWidth: 50,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'disk_type',
          title: '磁盘类型',
          width: 70,
          formatter: ({ cellValue }) => {
            return DISK_TYPES[cellValue]
          },
        },
        getStatusTableColumn({ statusModule: 'snapshot' }),
        {
          field: 'guest',
          title: '服务器',
          minWidth: 100,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate'>
                  {row.guest}
                  {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : ''}
                </div>,
              ]
            },
          },
        },
        {
          field: 'created_at',
          title: '创建时间',
          minWidth: 70,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
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
