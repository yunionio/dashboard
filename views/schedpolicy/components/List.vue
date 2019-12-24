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
import { getNameDescriptionTableColumn, getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { getNameFilter, getEnabledFilter, getFilter } from '@/utils/common/tableFilter'

export default {
  name: 'SchedpolicyList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'schedpolicies',
        getParams: { details: true },
        filterOptions: {
          name: getNameFilter(),
          enabled: getEnabledFilter(),
          'strategy': {
            label: '偏好',
            dropdown: true,
            multiple: true,
            items: STRATEGY_OPT,
          },
          schedtag: getFilter({
            field: 'schedtag',
            title: '调度标签',
          }),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'SchedpolicySidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getEnabledTableColumn(),
        {
          field: 'strategy',
          title: '偏好',
          width: 80,
          formatter: ({ row }) => {
            return STRATEGY_CN[row.strategy] || '无'
          },
        },
        getCopyWithContentTableColumn({
          field: 'schedtag',
          title: '调度标签',
        }),
        getCopyWithContentTableColumn({
          field: 'condition',
          title: '条件',
        }),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('CreateSchedpolicyDialog', {
              title: '创建调度策略',
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
              title: '删除调度策略',
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
          label: '启用',
          action: obj => {
            this.list.singleUpdate(obj.id, { enabled: true })
          },
          meta: obj => {
            return {
              validate: !obj.enabled,
            }
          },
        },
        {
          label: '禁用',
          action: obj => {
            this.list.singleUpdate(obj.id, { enabled: false })
          },
          meta: obj => {
            return {
              validate: obj.enabled,
            }
          },
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '调整策略',
                action: () => {
                  this.createDialog('UpdateSchedpolicyDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '调整策略',
                    list: this.list,
                  })
                },
              },
              {
                label: '删除',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除调度策略',
                    list: this.list,
                  })
                },
                meta: () => {
                  return {
                    validate: obj.can_delete,
                  }
                },
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('schedpolicy-detail')
    this.list.fetchData()
  },
}
</script>
