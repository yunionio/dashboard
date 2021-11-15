<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import {
  getStatusFilter,
  getInBrandFilter,
} from '@/utils/common/tableFilter'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'VpcNetworkList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    const scopeResource = this.$store.getters.scopeResource
    const l3PermissionEnable = this.$store.getters.l3PermissionEnable

    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'inter_vpc_networks',
        getParams: this.getParam,
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
          status: getStatusFilter('vpcNetwork'),
          brand: getInBrandFilter('brands', ['Aliyun', 'Qcloud']),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('common_715'), key: 'user_tags' },
          { label: this.$t('network.text_243'), key: 'vpc_count' },
          {
            label: this.$t('common_101'),
            key: 'public_scope',
            hidden: () => {
              return !l3PermissionEnable && (scopeResource && scopeResource.domain.includes('inter_vpc_networks'))
            },
          },
          { label: this.$t('table.title.brand'), key: 'provider' },
        ],
      },
      groupActions: [
        {
          label: this.$t('table.action.set_tag'),
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
          label: this.$t('network.text_131'),
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
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'VpcNetworkSidePage', {
        id: row.id,
        resource: 'inter_vpc_networks',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
