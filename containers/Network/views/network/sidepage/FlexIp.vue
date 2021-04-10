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
        id: 'FlexIpForNetworkSidePage',
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
          title: this.$t('network.text_656'),
        },
        {
          field: 'primary',
          title: this.$t('network.text_237'),
          formatter: ({ cellValue }) => {
            return cellValue ? this.$t('network.text_238') : this.$t('network.text_239')
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
