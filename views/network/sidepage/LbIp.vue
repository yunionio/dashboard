<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
export default {
  name: 'LbIp',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'loadbalancernetworks',
        getParams: {
          details: true,
          network_id: this.data.id,
        },
      }),
      columns: [
        {
          field: 'loadbalancer',
          title: '负载均衡',
        },
        {
          field: 'ip_addr',
          title: '服务地址',
        },
        {
          field: 'created_at',
          title: '创建时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format('YYYY年MM月DD日 HH:mm:ss')
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
