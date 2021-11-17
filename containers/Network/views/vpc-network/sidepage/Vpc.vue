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
import * as R from 'ramda'
import {
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
  name: 'vpcListForVpcNetworkSidePage',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
    getParams: [Function, Object],
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'vpcListForVpcNetworkSidePage',
        resource: 'vpcs',
        getParams: this.getParam,
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
        {
          field: 'name',
          title: this.$t('table.title.name'),
          minWidth: 120,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              return row.name
            },
          },
        },
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
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>
