<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import {
  getStatusFilter,
} from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  NEXT_HOP_TYPES,
  NEXT_HOP_TYPES_MAP,
  TYPES,
  TYPES_MAP,
} from '../constants'

export default {
  name: 'routeListForVpcPeerConnectSidePage',
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
        id: 'routeListForVpcPeerConnectSidePage',
        resource: 'route_table_route_sets',
        getParams: { next_hop_id: this.data.peer_vpc_id, next_hop_type: 'VpcPeering' },
        filterOptions: {
          cidr: {
            label: this.$t('network.vpc_network.target_address'),
            filter: true,
            formatter: val => {
              return `cidr.contains('${val}')`
            },
          },
          status: getStatusFilter('routeSet'),
          next_hop_type: {
            label: this.$t('network.next_hop_type'),
            dropdown: true,
            multiple: true,
            items: NEXT_HOP_TYPES.map(v => {
              return {
                label: v.value,
                key: v.key,
              }
            }),
            filter: true,
            formatter: val => {
              return `next_hop_type.contains("${val}")`
            },
          },
          type: {
            label: this.$t('network.text_249'),
            dropdown: true,
            multiple: true,
            items: TYPES.map(v => {
              return {
                label: v.value,
                key: v.key,
              }
            }),
            filter: true,
            formatter: val => {
              return `type.contains("${val}")`
            },
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
              return row.next_hop_id
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
        {
          field: 'route_table_id',
          title: this.$t('dictionary.route_table'),
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger name='RouteTableSidePage' options={{ resource: 'route_tables' }} id={row.route_table_id} vm={this}>{row.route_table_id}</side-page-trigger>,
              ]
            },
          },
        },
      ],
      groupActions: [],
      singleActions: [],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    refresh () {
      this.list.fetchData()
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'VpcSidePage', {
        id: row.vpc_id,
        resource: 'vpcs',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
