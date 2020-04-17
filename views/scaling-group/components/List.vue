<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
// import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getStatusFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'

export default {
  name: 'HostList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'scalinggroups',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('scalinggroup'),
          enabled: getEnabledFilter(),
          brand: {
            label: '平台',
            dropdown: true,
            multiple: true,
            items: [
              { label: 'OneCloud', key: 'OneCloud' },
            ],
          },
          // region: {
          //   label: '区域',
          // },
          guest_template: {
            label: '主机模版',
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '启用状态', key: 'enabled' },
          { label: '状态', key: 'status' },
          { label: '主机模版', key: 'guest_template' },
          { label: '当前实例数', key: 'instance_number' },
          { label: '期望实例数', key: 'desire_instance_number' },
          { label: '最小实例数', key: 'min_instance_number' },
          { label: '最大实例数', key: 'max_instance_number' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'brand' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'scalinggroups_create',
          action: () => {
            this.$router.push({
              name: 'ScalingGroupCreate',
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: '启用',
                permission: 'scalinggroups_perform_enable',
                action: () => {
                  this.list.batchPerformAction('enable', null)
                },
                meta: () => ({
                  validate: this.list.selectedItems.length,
                }),
              },
              {
                label: '禁用',
                permission: 'scalinggroups_perform_disable',
                action: () => {
                  this.list.batchPerformAction('disable', null)
                },
                meta: () => ({
                  validate: this.list.selectedItems.length,
                }),
              },
              {
                label: '删除',
                permission: 'servicecatalogs_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除账号',
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
  },
}
</script>
