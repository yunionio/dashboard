<template>
  <vxe-grid :data="resourceData" :columns="columns" />
</template>

<script>
import { getStatusTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ImageChildrenImageList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    const getResourceData = () => {
      if (!this.data.data_images) {
        return [{ ...this.data.root_image, type: 'sys' }]
      }
      return [{ ...this.data.root_image, type: 'sys' }].concat(this.data.data_images.map(val => ({ ...val, type: 'data' })))
    }
    return {
      columns: [
        {
          field: 'name',
          title: '镜像名称',
          width: 150,
        },
        {
          field: 'type',
          title: '类别',
          formatter: ({ cellValue }) => {
            return cellValue === 'data' ? '数据盘' : '系统盘'
          },
        },
        {
          field: 'size',
          title: '大小',
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'B', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'image' }),
        {
          field: 'disk_format',
          title: '格式',
          formatter: ({ cellValue }) => {
            return (cellValue && cellValue.toUpperCase()) || '-'
          },
        },
        getTimeTableColumn(),
      ],
      resourceData: getResourceData(),
    }
  },
}
</script>
