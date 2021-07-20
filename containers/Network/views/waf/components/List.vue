<template>
  <div>
    <loading-block v-if="loading" />
    <page-list
      v-else
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
import expectStatus from '@/constants/expectStatus'
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
      loading: false,
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
        steadyStatus: {
          status: Object.values(expectStatus.waf).flat(),
        },
      }),
      groupActions: [
        {
          label: this.$t('cloudenv.text_108'),
          permission: 'waf_instances_delete',
          action: () => {
            this.createDialog('DeleteWafInstancesDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('network.waf.delete'),
              name: this.$t('network.waf'),
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
  },
  methods: {
    refresh () {
      this.list.fetchData()
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'WafSidePage', {
        id: row.id,
        title: row.name,
        resource: 'waf_instances',
        apiVersion: 'v2',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
      })
      this.initSidePageTab(tab)
    },
    async syncWafStatus (row) {
      this.loading = true
      try {
        await new this.$Manager('waf_instances', 'v2').performAction({ id: row.id, action: 'syncstatus', data: {} })
        this.list.fetchData()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
