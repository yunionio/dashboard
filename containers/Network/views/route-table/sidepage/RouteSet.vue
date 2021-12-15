<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import {
  NEXT_HOP_TYPES_MAP,
  TYPES_MAP,
} from '../constants'

export default {
  name: 'RouteSetListForRouteTableSidePage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'routeSetListForVpcNetworkSidePage',
        resource: 'route_table_route_sets',
        getParams: { details: true, route_table_id: this.resId },
        filterOptions: {
          cidr: {
            label: this.$t('network.vpc_network.target_address'),
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'cidr',
          title: this.$t('network.text_244'),
          sortable: true,
        }),
        getStatusTableColumn({ statusModule: 'routeSet' }),
        {
          field: 'next_hop_id',
          title: this.$t('network.vpc_network.next_hop'),
          slots: {
            default: ({ row }) => {
              return row.next_hop_id || row.ext_next_hop_id
            },
          },
        },
        {
          field: 'next_hop_type',
          title: this.$t('network.next_hop_type'),
          slots: {
            default: ({ row }) => {
              return NEXT_HOP_TYPES_MAP[row.next_hop_type]?.value || row.next_hop_type
            },
          },
        },
        {
          field: 'type',
          title: this.$t('network.text_249'),
          slots: {
            default: ({ row }) => {
              return TYPES_MAP[row.type]?.value || row.type
            },
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('common.action.delete'),
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              name: this.$t('network.vpc_network.route'),
              title: this.$t('common.action.delete'),
              onManager: this.onManager,
              success: () => {
                this.destroySidePages()
              },
            })
          },
          meta: (obj) => {
            if (this.list.selectedItems.some(v => v.type !== 'Custom')) {
              return {
                validate: false,
                tooltip: this.$t('network.route_delete_tips'),
              }
            }
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('common.action.delete'),
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              name: this.$t('network.vpc_network.route'),
              title: this.$t('common.action.delete'),
              onManager: this.onManager,
              success: () => {
                this.destroySidePages()
              },
            })
          },
          meta: (obj) => {
            if (obj.type !== 'Custom') {
              return {
                validate: false,
                tooltip: this.$t('network.route_delete_tips'),
              }
            }
            return this.$getDeleteResult(obj)
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
