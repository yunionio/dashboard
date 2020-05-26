<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getStatusFilter, getBrandFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import expectStatus from '@/constants/expectStatus'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'FlexNetworkList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'networkinterfaces',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.network).flat(),
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          mac: {
            label: 'MAC地址',
            filter: true,
            // jointFilter: true,
            formatter: val => {
              return `mac.contains("${val}")`
            },
          },
          status: getStatusFilter('network'),
          brand: getBrandFilter(),
          associate_type: {
            label: '绑定设备类型',
            filter: true,
            formatter: val => {
              return `associate_type.contains("${val}")`
            },
          },
          project_domain: getProjectDomainFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: 'MAC地址', key: 'mac' },
          { label: '状态', key: 'status' },
          { label: '平台', key: 'brand' },
          { label: '绑定设备类型(VPC)', key: 'associate_type' },
          { label: 'CPU绑定设备', key: 'associate_id' },
          { label: '云账号', key: 'account' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '共享范围', key: 'public_scope' },
          { label: `所属${this.$t('dictionary.domain')}`, key: 'project_domain' },
        ],
      },
      groupActions: [
        // {
        //   label: '同步状态',
        //   action: () => {
        //     this.onManager('batchPerformAction', {
        //       steadyStatus: ['running', 'ready'],
        //       managerArgs: {
        //         action: 'syncstatus',
        //       },
        //     })
        //   },
        //   meta: () => ({
        //     validate: this.list.selected.length,
        //   }),
        // },
        getDomainChangeOwnerAction(this, {
          name: this.$t('dictionary.networkinterface'),
          resource: 'networkinterfaces',
        }),
        getSetPublicAction(this, {
          name: this.$t('dictionary.networkinterface'),
          scope: 'domain',
          resource: 'networkinterfaces',
        }),
      ],
    }
  },
  created () {
    this.initSidePageTab('flex-network-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'FlexNetworkSidePage', {
        id: row.id,
        resource: 'networkinterfaces',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
