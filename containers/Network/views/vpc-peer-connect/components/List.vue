<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="templateListColumns || columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions"
    :show-single-actions="!isTemplate"
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
  getBrandFilter,
  getDomainFilter,
  getAccountFilter,
  getCloudProviderFilter,
  getDescriptionFilter,
} from '@/utils/common/tableFilter'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'VpcPeerConnectList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
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
        resource: 'vpc_peering_connections',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.vpcPeerConnect).flat(),
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
          status: getStatusFilter('vpcPeerConnect'),
          brand: getBrandFilter('vpc_peer_brands'),
          project_domains: getDomainFilter(),
          cloudaccount: getAccountFilter(),
          manager: getCloudProviderFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
        ],
      },
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'vpc_peering_connections_create',
          action: () => {
            this.$router.push({
              name: 'VpcPeerConnectCreate',
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
        },
        {
          label: this.$t('table.action.set_tag'),
          permission: 'vpc_peering_connections_perform_set_user_metadata',
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
          permission: 'vpc_peering_connections_perform_syncstatus',
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
          permission: 'vpc_peering_connections_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('network.text_131'),
              name: this.$t('dictionary.vpc_peer_connect'),
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
    // this.initSidePageTab('detail')
    this.list.fetchData()
    this.$bus.$on('VpcPeerConnectListSingleRefresh', (...arg) => {
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
      this.sidePageTriggerHandle(this, 'VpcPeerConnectSidePage', {
        id: row.id,
        resource: 'vpc_peering_connections',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
