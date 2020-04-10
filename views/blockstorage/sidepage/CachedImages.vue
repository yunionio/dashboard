<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { getCopyWithContentTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import { getFilter } from '@/utils/common/tableFilter'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BlockStorageCachedImages',
  mixins: [WindowsMixin],
  props: {
    data: Object,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'cachedimages',
        ctx: [['storagecaches', this.data.storagecache_id]],
        getParams: this.getParams,
        idKey: 'cachedimage_id',
        filterOptions: {
          image: getFilter({ field: 'image', title: '名称' }),
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'image',
        }),
        {
          field: 'size',
          title: '文件大小',
          minWidth: 80,
          formatter: ({ row }) => {
            return sizestr(row.size, 'B', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'hostImageCache' }),
        getCopyWithContentTableColumn({
          field: 'path',
          title: '路径',
          minWidth: 200,
        }),
        getCopyWithContentTableColumn({
          field: 'reference',
          title: '引用',
          minWidth: 80,
        }),
      ],
      groupActions: [
        {
          label: '释放缓存',
          action: row => {
            this.createDialog('UncacheImageDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '释放缓存',
              list: this.list,
              resItem: this.data,
            })
          },
          meta: () => {
            const isReference = this.list.selectedItems.every(row => !row.reference)
            return {
              validate: !!this.list.selectedItems.length && isReference,
            }
          },
        },
      ],
      singleActions: [
        {
          label: '释放缓存',
          action: row => {
            this.createDialog('UncacheImageDialog', {
              data: [row],
              columns: this.columns,
              title: '释放缓存',
              list: this.list,
              resItem: this.data,
            })
          },
          meta: row => {
            const isValidate = !row.reference
            return {
              validate: isValidate,
              tooltip: !isValidate && '如需清除，请先删除当前宿主机上引用这个镜像的虚拟主机',
            }
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
