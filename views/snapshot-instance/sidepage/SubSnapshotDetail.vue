<template>
  <vxe-grid class="mb-2" :data="data.snapshots" :columns="columns" />
</template>

<script>
import { DISK_TYPES, STORAGE_TYPES } from '../constants'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'

export default {
  name: 'SubSnapshotDetail',
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
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: '快照名称' }),
        {
          field: 'size',
          title: '快照大小',
          formatter: ({ row }) => {
            return sizestr(row.size, 'M', 1024)
          },
        },
        {
          field: 'disk_type',
          title: '磁盘类型',
          formatter: ({ row }) => {
            return DISK_TYPES[row.disk_type] || row.disk_type
          },
        },
        {
          field: 'storage_type',
          title: '存储类型',
          formatter: ({ row }) => {
            return STORAGE_TYPES[row.storage_type] || row.storage_type || '-'
          },
        },
        // getStatusTableColumn({ statusModule: 'snapshot' }),
        {
          field: 'created_at',
          title: '创建时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
      ],
    }
  },
}
</script>
