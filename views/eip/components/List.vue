<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getStatusFilter, getBrandFilter, getAccountFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'EipList',
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
        resource: 'eips',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          brand: getBrandFilter(),
          ip_addr: {
            label: '地址',
            filter: true,
            formatter: val => {
              return `ip_addr.contains("${val}")`
            },
          },
          status: getStatusFilter('eip'),
          // tenant: getTenantFilter(), //后台暂时不支持项目筛选
          account: getAccountFilter(),
          charge_type: {
            label: '计费方式',
            dropdown: true,
            multiple: false,
            // distinctField: {
            //   type: 'extra_field',
            //   key: 'charge_type',
            // },
            items: [
              { label: '按流量计费', key: 'traffic' },
              { label: '按带宽计费', key: 'bandwidth' },
            ],
          },
        },
        steadyStatus: Object.values(expectStatus.eip).flat(),
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '地址', key: 'ip_addr' },
          { label: '带宽', key: 'bandwidth' },
          { label: '云账号', key: 'account' },
          { label: '状态', key: 'status' },
          { label: '计费方式', key: 'charge_type' },
          { label: '绑定资源', key: 'associate_name' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'provider' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'eips_create',
          action: () => {
            this.createDialog('EipCreateDialog', {
              title: '新建',
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '批量操作',
          actions: () => {
            return [
              {
                label: '同步状态',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
              },
              {
                label: '删除',
                permission: 'eips_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    name: this.$t('dictionary.eip'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selected.length,
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('eip-detail')
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
      this.sidePageTriggerHandle(this, 'EipSidePage', {
        id: row.id,
        resource: 'eips',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.eip).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
