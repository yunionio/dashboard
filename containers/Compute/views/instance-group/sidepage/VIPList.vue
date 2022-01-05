<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/vipcolumns'
import SingleActionsMixin from '../mixins/vipsingleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'GroupNetworkList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    resId: String,
    data: {
      type: Object,
      required: true,
    },
    serverColumns: {
      type: Array,
      default: () => ([]),
    },
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'networks',
        ctx: [['instancegroups', this.resId]],
        idKey: 'ip_addr',
        getParams: {
          order_by: 'ip_addr',
          order: 'asc',
          ...this.getParams,
        },
      }),
      groupActions: [
        {
          label: this.$t('compute.create_vip'),
          action: () => {
            this.createDialog('InstanceGroupAddVipNetworkDialog', {
              title: this.$t('compute.create_vip'),
              data: [this.data],
              columns: this.serverColumns,
              resId: this.resId,
              refresh: this.refresh,
              total: this.list.total,
            })
          },
          meta: () => {
            let tooltip = null
            if (!this.data.network_id) {
              tooltip = this.$t('compute.instance_group_no_network_id')
            }
            if (this.list.total >= 1) {
              tooltip = this.$t('compute.too_many_instance_group_vip')
            }
            return {
              buttonType: 'primary',
              validate: (this.data.network_id !== '' && this.list.total < 1),
              tooltip,
            }
          },
          hidden: this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_add_network_card'),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('event-drawer')
    this.list.fetchData()
  },
  methods: {
    handleOpenNetworkDetail (id) {
      this.initSidePageTab('network-detail')
      this.sidePageTriggerHandle(this, 'NetworkSidePage', {
        id,
        resource: 'networks',
      })
    },
    refresh () {
      this.list.refresh()
      this.$bus.$emit('InstanceGroupListRefresh')
    },
  },
}
</script>
