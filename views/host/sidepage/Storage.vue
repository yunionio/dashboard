<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getEnabledTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'StorageList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'storages',
        ctx: [['hosts', this.resId]],
        idKey: 'storage_id',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'storage',
          title: '名称',
          showOverflow: 'ellipsis',
          minWidth: 120,
        },
        {
          field: 'capacity',
          title: '容量',
          showOverflow: 'ellipsis',
          minWidth: 70,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'used_capacity',
          title: '分配',
          showOverflow: 'ellipsis',
          minWidth: 70,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'waste_capacity',
          title: '浪费',
          showOverflow: 'ellipsis',
          minWidth: 70,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'storage_type',
          title: '存储类型',
          showOverflow: 'ellipsis',
          minWidth: 100,
          formatter: ({ cellValue }) => {
            switch (cellValue) {
              case 'local':
                return '本地存储'
              case 'baremetal':
                return '物理机存储'
              case 'nas':
                return '网络存储'
              case 'vsan':
                return 'vSAN'
              default:
                return cellValue
            }
          },
        },
        getEnabledTableColumn(),
        {
          field: 'mount_point',
          title: '挂载点',
          showOverflow: 'ellipsis',
          minWidth: 120,
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
