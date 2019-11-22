<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
export default {
  name: 'HostMachineip',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'baremetalnetworks',
        getParams: {
          details: true,
          with_meta: true,
          network_id: this.data.id,
        },
      }),
      columns: [
        {
          field: 'host',
          title: '宿主机',
        },
        {
          field: 'ip_addr',
          title: 'IP地址',
        },
        {
          field: 'mac_addr',
          title: 'MAC地址',
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
