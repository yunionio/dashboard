<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getStatusFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'InstanceGroupList',
  mixins: [WindowsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'instancegroups',
        getParams: {
          detail: true,
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          status: getStatusFilter('instanceGroup'),
          force_dispersion: {
            label: '策略',
            dropdown: true,
            items: [
              { label: '强制', key: true },
              { label: '非强制', key: false },
            ],
          },
          enabled: {
            label: '启用状态',
            dropdown: true,
            items: [
              { label: '启用', key: true },
              { label: '禁用', key: false },
            ],
          },
          tenant: {
            label: '项目',
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '启用状态', key: 'enabled' },
          { label: '名称', key: 'name' },
          { label: '策略', key: 'force_dispersion' },
          { label: '粒度', key: 'granularity' },
          { label: '绑定主机数量', key: 'guest_count' },
          { label: '项目', key: 'tenant' },
          { label: '创建时间', key: 'created_at' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'InstanceGroupSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getEnabledTableColumn(),
        {
          field: 'force_dispersion',
          title: '策略',
          width: 70,
          formatter: ({ cellValue }) => {
            let ret = '非强制'
            if (cellValue) ret = '强制'
            return ret
          },
        },
        getStatusTableColumn({ statusModule: 'instanceGroup' }),
        {
          field: 'granularity',
          title: '粒度',
          width: 70,
        },
        {
          field: 'guest_count',
          title: '绑定主机数量',
          width: 120,
          formatter: ({ cellValue }) => `${cellValue || 0}`,
        },
        getProjectTableColumn(),
        getTimeTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('InstanceGroupCreateDialog', {
              list: this.list,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除主机组',
              list: this.list,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
      singleActions: [
        {
          label: '绑定主机',
          action: (obj) => {
            this.createDialog('InstanceGroupBindServerDialog', {
              columns: this.columns,
              data: [obj],
              list: this.list,
            })
          },
          meta: (obj) => ({
            validate: obj.enabled,
            tooltip: !obj.enabled ? '启用后重试' : null,
          }),
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '启用',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'enable',
                    },
                  })
                },
                meta: () => ({
                  validate: !obj.enabled,
                }),
              },
              {
                label: '禁用',
                action: () => {
                  this.list.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'disable',
                    },
                  })
                },
                meta: () => ({
                  validate: obj.enabled,
                }),
              },
              {
                label: '删除',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除主机组',
                    list: this.list,
                    success: () => this.destroySidePages(),
                  })
                },
                meta: () => this.$getDeleteResult(obj),
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('instance-group-detail')
    this.list.fetchData()
    this.$bus.$on('InstanceGroupListRefresh', () => {
      this.list.refresh()
    }, this)
  },
}
</script>
