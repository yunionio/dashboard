<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import numerify from 'numerify'
import { getNameDescriptionTableColumn, getTimeTableColumn, getStatusTableColumn, getEnabledTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'

export default {
  name: 'ScalingGroupRuleListSidePage',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'scalingpolicies',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('scalingpolicie'),
          enabled: getEnabledFilter(),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          // hideField: true,
          // slotCallback: row => {
          //   return (
          //     <side-page-trigger name='FiexGroupSidePage' id={row.id} list={this.list} vm={this}>{ row.name }</side-page-trigger>
          //   )
          // },
        }),
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'scalingpolicie' }),
        {
          field: 'trigger_type',
          title: '策略类型',
          width: 120,
          formatter: ({ cellValue }) => {
            return this.$t('flexGrouTriggerType')[cellValue]
          },
        },
        {
          field: 'trigger_type',
          title: '触发条件',
          width: 300,
          formatter: ({ row }) => {
            return this.formatTriggerType(row)
          },
        },
        {
          field: 'action',
          title: '执行动作',
          width: 100,
          formatter: ({ row }) => {
            const acn = this.$t('flexGroupRuleAction')[row.action]
            return `${acn}${row.number}个实例`
          },
        },
        getTimeTableColumn(),
      ],
      singleActions: [
        {
          label: '立即执行',
          action: obj => {
            this.createDialog('FlexRuleStartDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: (obj) => ({
            validate: obj.enabled,
            tooltip: !obj.enabled && '仅启用状态下支持此操作',
          }),
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '启用',
                action: obj => {
                  this.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'enable',
                    },
                  })
                },
                meta: (obj) => ({
                  validate: !obj.enabled,
                }),
              },
              {
                label: '禁用',
                action: (obj) => {
                  this.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'disable',
                    },
                  })
                },
                meta: (obj) => ({
                  validate: obj.enabled,
                }),
              },
              {
                label: '删除',
                action: (obj) => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除',
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
              },
            ]
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('FiexRuleListCreateDialog', {
              title: '新建',
              resData: this.data,
              refresh: this.refresh,
              onManager: this.onManager,
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
                action: () => {
                  this.list.batchPerformAction('enable', null)
                },
                meta: () => ({
                  validate: this.list.selectedItems.length,
                }),
              },
              {
                label: '禁用',
                action: () => {
                  this.list.batchPerformAction('disable', null)
                },
                meta: () => ({
                  validate: this.list.selectedItems.length,
                }),
              },
              {
                label: '删除',
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
    formatTriggerType (row) {
      const type = row['trigger_type']
      // 告警策略
      if (type === 'alarm' && row['alarm']) {
        const { indicator, wrapper, value, cumulate } = row['alarm']
        const wrapperType = {
          min: '>',
          max: '<',
        }
        const unit = indicator === 'cpu' ? '%' : 'b/s'
        const cumulateTxt = `连续满足${cumulate}次后触发`
        return `${this.$t('flexGroupIndicator')[indicator]} ${wrapperType[wrapper]} ${value} ${unit}，${cumulateTxt}`
      }
      // 定时策略
      if (type === 'timing' && row['timer']) {
        const timeTxt = this.$moment(row.timer['exec_time']).format()
        return `${timeTxt} 触发`
      }
      // 周期策略
      if (type === 'cycle' && row['cycle_timer']) {
        const timer = row['cycle_timer']
        const { hour, minute } = timer
        const typeTxt = this.$t('flexGroupCycleType')[timer['cycle_type']]
        let itemsTxt = ''
        // 周
        if (timer['cycle_type'] === 'week' && timer['week_day'].length > 0) {
          itemsTxt = '【' + timer['week_day'].map(v => {
            return this.$t('flexGroupSubCycleTypeWeek')[v]
          }).join('|') + '】'
        }
        // 月
        if (timer['cycle_type'] === 'month') {
          itemsTxt = '【' + timer['month_day'].map(v => {
            return `${v}号`
          }).join('|') + '】'
        }
        return `每${typeTxt}${itemsTxt}${`${numerify(hour, '00')}:${numerify(minute, '00')}`}触发`
      }
      return '-'
    },
  },
}
</script>
