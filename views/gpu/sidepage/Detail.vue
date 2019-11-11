<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
export default {
  name: 'GpuDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'model',
          title: '设备型号',
        },
        {
          field: 'dev_type',
          title: '设备类型',
        },
        {
          field: 'host',
          title: '所在宿主机',
        },
        {
          field: 'guest',
          title: '关联主机',
          formatter: function ({ row }) {
            return row.guest || row.guest_id
          },
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'addr',
              title: 'PCI_BUS_ID',
            },
          ],
        },
      ],
    }
  },
}
</script>
