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
        id: 'HostMachineipForNetworkSidePage',
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
          title: this.$t('network.text_70'),
        },
        {
          field: 'ip_addr',
          title: this.$t('network.text_213'),
        },
        {
          field: 'mac_addr',
          title: this.$t('network.text_228'),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
