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
  getEnabledTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import {
  getEnabledFilter,
  getRegionFilter,
} from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  name: 'routeListForVpcNetworkSidePage',
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
        id: 'routeListForVpcNetworkSidePage',
        resource: 'inter_vpc_network_route_sets',
        getParams: { details: true, inter_vpc_network_id: this.resId },
        filterOptions: {
          cidr: {
            label: this.$t('network.vpc_network.target_address'),
          },
          enabled: getEnabledFilter(),
          vpc: {
            label: 'VPC',
          },
          region: getRegionFilter(),
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'cidr',
          title: this.$t('network.vpc_network.target_address'),
          sortable: true,
        }),
        getStatusTableColumn({ statusModule: 'routeSet' }),
        getEnabledTableColumn(),
        {
          field: 'vpc',
          title: this.$t('network.vpc_network.next_hop'),
          minWidth: 100,
          sortable: true,
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.vpc }</side-page-trigger>,
              ]
            },
          },
        },
        getRegionTableColumn({ title: this.$t('network.vpc_network.next_hop_region') }),
      ],
      groupActions: [
        ...getEnabledSwitchActions(this, undefined, [], {
          resourceName: this.$t('network.vpc_network.route'),
          fields: ['cidr', 'status', 'enabled'],
          metas: [
            () => {
              const isDisable = this.list.selectedItems.some(item => !item.enabled)
              return {
                validate: this.list.selectedItems.length && isDisable,
              }
            },
            () => {
              const isEnable = this.list.selectedItems.every(item => item.enabled)
              return {
                validate: this.list.selectedItems.length && isEnable,
              }
            },
          ],
        }),
      ],
      singleActions: [
        ...getEnabledSwitchActions(this, undefined, [], {
          resourceName: this.$t('network.vpc_network.route'),
          fields: ['cidr', 'status', 'enabled'],
        }),
      ],
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
