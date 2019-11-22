<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
export default {
  name: 'ReservedIp',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'reservedips',
        getParams: {
          details: true,
          with_meta: true,
          network_id: this.data.id,
        },
      }),
      columns: [
        {
          field: 'ip_addr',
          title: 'IP地址',
        },
        {
          field: 'notes',
          title: '备注',
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
