<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'NetworkSecgroupListForSecgroupSidepage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'guestnetworksecgroups',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'guest',
          title: this.$t('dictionary.server'),
          slots: {
            default: ({ row }) => {
              return [<side-page-trigger permission='servers_get' name='VmInstanceSidePage' id={row.guest_id} vm={this}>{row.guest}</side-page-trigger>]
            },
          },
        },
        {
          field: 'network_index',
          title: this.$t('compute.network_index'),
          width: 80,
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.text_723'),
          action: (obj) => {
            this.createDialog('VmSidepageRevokeNetworkSecgroupDialog', {
              detailData: { id: obj.guest_id },
              data: [obj],
              secgroupType: 'network',
              refresh: () => {
                this.$bus.$emit('secgroup-list-refresh')
                this.list.refresh()
              },
            })
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
