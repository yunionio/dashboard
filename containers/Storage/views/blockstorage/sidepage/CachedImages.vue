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
        id: 'CachedImageListForBlockStorageSidePage',
        resource: 'cachedimages',
        ctx: [['storagecaches', this.data.storagecache_id]],
        getParams: this.getParams,
        idKey: 'cachedimage_id',
        filterOptions: {
          image: getFilter({ field: 'image', title: this.$t('storage.text_40') }),
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'image',
        }),
        {
          field: 'size',
          title: this.$t('storage.text_71'),
          minWidth: 80,
          formatter: ({ row }) => {
            return sizestr(row.size, 'B', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'hostImageCache' }),
        getCopyWithContentTableColumn({
          field: 'path',
          title: this.$t('storage.text_72'),
          minWidth: 200,
        }),
        getCopyWithContentTableColumn({
          field: 'reference',
          title: this.$t('storage.text_73'),
          minWidth: 80,
        }),
      ],
      groupActions: [
        {
          label: this.$t('storage.text_74'),
          action: row => {
            this.createDialog('UncacheImageDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('storage.text_74'),
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
          label: this.$t('storage.text_74'),
          action: row => {
            this.createDialog('UncacheImageDialog', {
              data: [row],
              columns: this.columns,
              title: this.$t('storage.text_74'),
              list: this.list,
              resItem: this.data,
            })
          },
          meta: row => {
            const isValidate = !row.reference
            return {
              validate: isValidate,
              tooltip: !isValidate && this.$t('storage.text_75'),
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
