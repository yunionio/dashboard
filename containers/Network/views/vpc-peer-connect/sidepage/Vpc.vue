<template>
  <div>
    <page-list
      :hideRowselect="true"
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
  getAccountFilter,
  getCloudProviderFilter,
} from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'vpcListForVpcPeerConnectSidePage',
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
        id: 'vpcListForVpcPeerConnectSidePage',
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
          cloudaccount: getAccountFilter(),
          manager: getCloudProviderFilter(),
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'name',
          title: this.$t('table.title.name'),
          sortable: true,
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
      groupActions: [],
      singleActions: [],
    }
  },
  created () {
    this.initSidePageTab('vpc-detail')
    this.list.fetchData()
  },
  methods: {
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
