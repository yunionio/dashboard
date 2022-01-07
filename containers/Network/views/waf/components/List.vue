<template>
  <div>
    <page-list
      :list="list"
      :columns="columns"
      :show-tag-filter="true"
      :show-tag-columns="true"
      :group-actions="groupActions"
      :single-actions="singleActions"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getDescriptionFilter, getBrandFilter, getAccountFilter, getDomainFilter, getRegionFilter, getCloudProviderFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

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
          id: {
            label: this.$t('network.waf.id'),
          },
          external_id: {
            label: this.$t('table.title.external_id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
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
          manager: getCloudProviderFilter(),
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
          label: this.$t('table.action.set_tag'),
          permission: 'waf_instances_perform_set_user_metadata',
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              mode: 'add',
              params: {
                resources: 'waf_instance',
              },
              tipName: this.$t('network.waf'),
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
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
          { label: this.$t('table.title.user_tag'), key: 'user_tags' },
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
  },
}
</script>
