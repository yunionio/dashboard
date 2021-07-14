<template>
  <div>
    <page-list
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter, getBrandFilter, getAccountFilter, getDomainFilter, getRegionFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'WafList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        apiVersion: 'v2',
        resource: 'waf_instances',
        getParams: { details: true },
        filterOptions: {
          name: getNameFilter(),
          type: {
            label: this.$t('network.waf.type'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'type',
            },
          },
          brand: getBrandFilter(),
          account: getAccountFilter(),
          domain: getDomainFilter(),
          region: getRegionFilter(),
        },
        hiddenColumns: [],
      }),
      groupActions: [
        {
          label: this.$t('cloudenv.text_108'),
          permission: 'waf_instances_delete',
          action: () => {
            this.createDialog('WafInstancesDeleteDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('bill.text_298'),
              name: this.$t('bill.text_297'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
      ],
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('network.waf.type'), key: 'type' },
          { label: this.$t('table.title.brand'), key: 'brand' },
          { label: this.$t('res.cloudaccount'), key: 'account' },
          { label: this.$t('network.waf.manager'), key: 'manager' },
          { label: this.$t('res.region'), key: 'region' },
        ],
      },
    }
  },
  created () {
    this.list.fetchData()
    this.createDialog('WafRuleInfoDialog', {
      title: this.$t('network.waf.rule_view'),
      type: 'view',
      data: [{
        id: 'd6060d59-152f-48c4-8eb9-5fc8aaed4536',
        name: 'hhh',
        action: {
          action: 'Allow',
        },
        priority: 100,
      }],
      onManager: this.onManager,
    })
  },
  methods: {
    refresh () {
      this.list.fetchData()
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'WafSidePage', {
        id: row.id,
        title: row.name,
        resource: 'waf_instances',
        apiVersion: 'v2',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
        // hiddenActions: this.hiddenActions,
      })
      this.initSidePageTab('')
    },
    openSidePageWafRuleList (row) {
      this.sidePageTriggerHandle(this, 'WafSidePage', {
        id: row.id,
        title: row.name,
        resource: 'waf_instances',
        apiVersion: 'v2',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
        // hiddenActions: this.hiddenActions,
      })
      this.initSidePageTab('rule-manage')
    },
    openSidePageWafResourceList (row) {
      this.sidePageTriggerHandle(this, 'WafSidePage', {
        id: row.id,
        title: row.name,
        resource: 'waf_instances',
        apiVersion: 'v2',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
        // hiddenActions: this.hiddenActions,
      })
      this.initSidePageTab('resource-manage')
    },
    async syncWafStatus (row) {
      await new this.$Manager('waf_instances', 'v2').performAction({ id: row.id, action: 'syncstatus', data: {} })
      this.list.fetchData()
    },
  },
}
</script>
