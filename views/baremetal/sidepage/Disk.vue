<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import { ALL_STORAGE } from '@Compute/constants'
import { getCopyWithContentTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'DiskListForBaremetalSidepage',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'disks',
        ctx: [['servers', this.resId]],
        idKey: 'disk_id',
        steadyStatus: Object.values(expectStatus.disk).flat(),
        getParams: this.getParams,
        filterOptions: {
          network: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `network.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        {
          field: 'index',
          title: '序号',
          width: 50,
          formatter: ({ row }) => {
            return row.index ? row.index : '0'
          },
        },
        getCopyWithContentTableColumn({ field: 'disk', title: '磁盘' }),
        {
          field: 'disk_size',
          title: '大小',
          sortable: true,
          showOverflow: 'ellipsis',
          minWidth: 60,
          formatter: ({ row }) => {
            return sizestr(row.disk_size, 'M', 1024)
          },
        },
        {
          field: 'driver',
          title: '驱动',
          width: 80,
        },
        {
          field: 'cache_mode',
          title: '缓存模式(cache mode)',
          width: 150,
          formatter: ({ row }) => {
            return row.cache_mode ? row.cache_mode : '-'
          },
        },
        getStatusTableColumn({ statusModule: 'disk' }),
        {
          field: 'storage_type',
          title: '存储类型',
          width: 80,
          formatter: ({ row }) => {
            if (row.storage_type) {
              if (row.storage_type === 'baremetal') return '裸金属'
              return (ALL_STORAGE[row.storage_type] && ALL_STORAGE[row.storage_type].label) || row.storage_type
            }
            return '-'
          },
        },
        {
          field: 'disk_type',
          title: '磁盘类型',
          width: 80,
          formatter: ({ row }) => {
            const diskType = {
              sys: '系统盘',
              data: '数据盘',
            }
            if (row.disk_type) {
              return diskType[row.disk_type] || row.disk_type
            }
            return '-'
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
