<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import { typeClouds } from '@/utils/common/hypervisor'
import ListMixin from '@/mixins/list'

export default {
  name: 'NetworkList',
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
        ctx: [['servers', this.resId]],
        idKey: 'index',
        getParams: {
          order_by: 'index',
          order: 'asc',
          ...this.getParams,
        },
      }),
      groupActions: [
        {
          label: this.$t('compute.text_199'),
          action: () => {
            this.createDialog('VmSetNetworkDialog', {
              title: this.$t('compute.text_199'),
              data: [this.data],
              columns: this.serverColumns,
              resId: this.resId,
              refresh: this.refresh,
              total: this.list.total,
            })
          },
          meta: () => {
            const isOneCloud = this.data.hypervisor === typeClouds.hypervisorMap.kvm.key
            let tooltip = null
            if (!isOneCloud) {
              tooltip = this.$t('compute.text_355')
            }
            if (this.list.total >= 8) {
              tooltip = this.$t('compute.text_731')
            }
            return {
              buttonType: 'primary',
              validate: isOneCloud && this.list.total < 8,
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
  },
}
</script>
