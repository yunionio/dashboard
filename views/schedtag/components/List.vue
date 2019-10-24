<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { STRATEGY_OPT, STRATEGY_CN } from '@Cloudenv/constants/sched'
import WindowsMixin from '@/mixins/windows'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SchedtagList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'schedtags',
        getParams: { details: true },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          'default_strategy': {
            label: '偏好',
            dropdown: true,
            multiple: true,
            items: STRATEGY_OPT,
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'SchedtagSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'default_strategy',
          title: '偏好',
          formatter: ({ row }) => {
            return STRATEGY_CN[row.default_strategy] || '无'
          },
        },
        {
          field: 'resource_type',
          title: '资源类型',
          formatter: ({ row }) => {
            let table = { hosts: '宿主机', storages: '存储', networks: '网络' }
            return table[row.resource_type] || '无'
          },
        },

        {
          field: 'resource_count',
          title: '资源数量',
          formatter: ({ row }) => {
            return row.host_count || row.storage_count || row.network_count || '0'
          },
        },
        {
          field: 'dynamic_schedtag_count',
          title: '关联动态调度标签',
          formatter: ({ row }) => {
            return row.dynamic_schedtag_count || '0'
          },
        },
        {
          field: 'schedpolicy_count',
          title: '关联调度策略',
          formatter: ({ row }) => {
            return row.schedpolicy_count || '0'
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('CreateSchedtagDialog', {
              title: '创建调度标签',
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
              title: '删除调度标签',
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '更改所属',
          action: obj => {
            this.createDialog('SetOwnerDialog', {
              data: [obj],
              columns: this.columns,
              title: '更改所属',
              list: this.list,
            })
          },
        },
        {
          label: '偏好设置',
          action: obj => {
            this.createDialog('SetStrategyDialog', {
              data: [obj],
              columns: this.columns,
              title: '偏好设置',
              list: this.list,
            })
          },
        },
        {
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除调度标签',
              list: this.list,
            })
          },
          meta: obj => {
            return {
              validate: obj.can_delete,
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('schedtag-detail')
    this.list.fetchData()
  },
}
</script>
