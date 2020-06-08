<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'

const DEVICE_MAP = {
  '10de': 'nvidia',
  1002: 'amd',
}

export default {
  name: 'GpuList',
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
        resource: 'isolated_devices',
        getParams: {
          gpu: true,
          host: this.resId,
        },
      }),
      columns: [
        {
          field: 'dev_type',
          title: '设备类型',
        },
        {
          field: 'model',
          title: '设备型号',
          slots: {
            default: ({ cellValue, row }, h) => {
              const device = row.vendor_device_id.split(':')[0]
              if (!device) {
                return cellValue
              }
              return [
                <span>{row.model}</span>,
                <icon type={ DEVICE_MAP[device] } />,
              ]
            },
          },
        },
        {
          field: 'guest_id',
          title: '关联主机',
          formatter: ({ cellValue, row }) => {
            return row.guest || cellValue
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
