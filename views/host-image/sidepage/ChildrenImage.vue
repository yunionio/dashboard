<template>
  <vxe-grid :data="resourceData" :columns="columns" :resizable="true" />
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
          title: this.$t('compute.text_627'),
          width: 150,
        },
        {
          field: 'type',
          title: this.$t('compute.text_628'),
          formatter: ({ cellValue }) => {
            return cellValue === 'data' ? this.$t('compute.text_50') : this.$t('compute.text_49')
          },
        },
        {
          field: 'size',
          title: this.$t('compute.text_377'),
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'B', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'image' }),
        {
          field: 'disk_format',
          title: this.$t('compute.text_398'),
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
