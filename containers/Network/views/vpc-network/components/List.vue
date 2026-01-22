<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="templateListColumns || columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions"
    :show-page="!isTemplate" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import {
  getStatusFilter,
  getInBrandFilter,
  getDomainFilter,
  getAccountFilter,
  getCloudProviderFilter,
  getDescriptionFilter,
} from '@/utils/common/tableFilter'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'VpcNetworkList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'inter_vpc_networks',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.vpcNetwork).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          description: getDescriptionFilter(),
          status: getStatusFilter('vpcNetwork'),
          brand: getInBrandFilter('brands', ['Aliyun', 'Qcloud']),
          project_domains: getDomainFilter(),
          cloudaccount: getAccountFilter(),
          manager: getCloudProviderFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('common_715'), key: 'user_tags' },
          { label: this.$t('network.text_243'), key: 'vpc_count' },
          { label: this.$t('common.attribution_scope'), key: 'project_domain' },
          { label: this.$t('table.title.brand'), key: 'provider' },
          { label: this.$t('res.cloudaccount'), key: 'manager' },
        ],
      },
      groupActions: [
        {
          label: this.$t('table.action.set_tag'),
          permission: 'inter_vpc_networks_perform_set_user_metadata',
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              mode: 'add',
              params: {
                resources: 'inter_vpc_networks',
              },
              tipName: this.$t('dictionary.vpc_network'),
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
        {
          label: this.$t('network.text_201'),
          permission: 'inter_vpc_networks_perform_syncstatus',
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['running', 'ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
        {
          label: this.$t('network.text_131'),
          permission: 'inter_vpc_networks_perform_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('network.text_131'),
              name: this.$t('dictionary.vpc_network'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
    this.$bus.$on('VpcNetworkListSingleRefresh', (...arg) => {
      this.list.refresh(...arg)
    }, false)
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'VpcNetworkSidePage', {
        id: row.id,
        resource: 'inter_vpc_networks',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
