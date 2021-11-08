<template>
  <div>
    <a-alert type="warning" class="mb-2" :showIcon="false" :message="$t('network.vpc_network.vpc_action_refresh')" banner />
    <page-list
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import {
  getRegionFilter,
} from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'vpcListSidePage',
  mixins: [WindowsMixin],
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
        id: 'vpcListForVpcNetworkSidePage',
        resource: 'vpcs',
        getParams: { details: true, inter_vpc_network_id: this.resId },
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          cidr_block: {
            label: this.$t('network.text_244'),
          },
          region: getRegionFilter(),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getCopyWithContentTableColumn({
          field: 'cidr_block',
          title: this.$t('network.text_244'),
          sortable: true,
        }),
        getRegionTableColumn(),
        getBrandTableColumn(),
        getAccountTableColumn(),
      ],
      groupActions: [
        {
          label: this.$t('network.text_719'),
          action: () => {
            this.createDialog('AssociateVpcForVpcNetworkDialog', {
              title: this.$t('network.text_719'),
              data: [this.data],
              resData: this.data,
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              validate: true,
              buttonType: 'primary',
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('network.text_219'),
          action: (obj) => {
            this.createDialog('RemoveVpcForVpcNetworkDialog', {
              title: this.$t('network.text_719'),
              data: [obj],
              resData: this.data,
              columns: this.columns,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              validate: true,
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('vpc-detail')
    this.list.fetchData()
  },
  methods: {
    refresh (num) {
      if (num) {
        let refreshNum = 0
        if (refreshNum === 0) {
          const timer = setInterval(() => {
            refreshNum++
            this.list.fetchData()
            if (refreshNum >= num) {
              clearInterval(timer)
            }
          }, 6000)
        }
      } else {
        this.list.fetchData()
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'VpcSidePage', {
        id: row.id,
        resource: 'vpcs',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
