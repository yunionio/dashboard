<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
export default {
  name: 'FlexIp',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'networkinterfacenetworks',
        getParams: {
          details: true,
          with_meta: true,
          network_id: this.data.id,
          system: true,
        },
      }),
      columns: [
        {
          field: 'ip_addr',
          title: 'IP',
        },
        {
          field: 'networkinterface_id',
          title: '虚拟网卡ID',
        },
        {
          field: 'primary',
          title: '主IP',
          formatter: ({ cellValue }) => {
            return cellValue ? '是' : '否'
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
