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
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import { getStatusFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
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
        id: 'RuleListForScalingGroupSidePage',
        resource: 'scalingpolicies',
        apiVersion: 'v1',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.scalingpolicie).flat(),
        filterOptions: {
          name: {
            label: this.$t('compute.text_228'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('scalingpolicie'),
          enabled: getEnabledFilter(),
          trigger_type: {
            label: this.$t('compute.text_913'),
            dropdown: true,
            items: Object.keys(this.$t('flexGrouTriggerType')).map(k => {
              return {
                label: this.$t('flexGrouTriggerType')[k],
                key: k,
              }
            }),
          },
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
          title: this.$t('compute.text_913'),
          width: 120,
          formatter: ({ cellValue }) => {
            return this.$t('flexGrouTriggerType')[cellValue]
          },
        },
        {
          field: 'cycle',
          title: this.$t('compute.text_914'),
          width: 300,
          formatter: ({ row }) => {
            return this.formatTriggerType(row)
          },
        },
        {
          field: 'action',
          title: this.$t('compute.text_929'),
          width: 100,
          formatter: ({ row }) => {
            const acn = this.$t('flexGroupRuleAction')[row.action]
            return this.$t('compute.text_961', [acn, row.number])
          },
        },
        {
          field: 'cooling_time',
          title: this.$t('compute.text_962'),
          width: 100,
          formatter: ({ row }) => {
            return this.$t('compute.text_963', [row.cooling_time])
          },
        },
        // {
        //   field: 'startTimeAndendTime',
        //   title: '有效时间',
        //   width: 160,
        //   slots: {
        //     default: ({ row }) => {
        //       const { start_time: startTime, end_time: endTime } = row.cycle_timer
        //       if (startTime && endTime) {
        //         return [
        //           <div>
        //             {this.$moment(startTime).format()} <br/>
        //             {this.$moment(endTime).format()}
        //           </div>,
        //         ]
        //       }
        //     },
        //   },
        // },
        getTimeTableColumn(),
      ],
      singleActions: [
        {
          label: this.$t('compute.text_249'),
          action: obj => {
            this.createDialog('FlexRuleStartDialog', {
              data: [obj],
              columns: this.columns,
              title: this.$t('compute.text_249'),
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: (obj) => {
            let tooltip = ''
            if (!this.data.enabled) {
              tooltip = this.$t('compute.text_964')
            }
            if (!obj.enabled) {
              tooltip = this.$t('compute.text_965')
            }
            if (obj.status !== 'ready') {
              tooltip = this.$t('compute.text_966')
            }
            return {
              validate: !tooltip,
              tooltip,
            }
          },
        },
        {
          label: this.$t('compute.text_352'),
          actions: obj => {
            return [
              ...getEnabledSwitchActions(this, obj, ['scalingpolicies_perform_enable', 'scalingpolicies_perform_disable']),
              {
                label: this.$t('compute.text_261'),
                permission: 'scalingpolicies_delete',
                action: (obj) => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: this.$t('compute.text_261'),
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: (obj) => {
                  return {
                    validate: !obj.enabled,
                    tooltip: obj.enabled && this.$t('compute.text_967'),
                  }
                },
              },
            ]
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.text_18'),
          permission: 'scalingpolicies_create',
          action: () => {
            this.createDialog('FiexRuleListCreateDialog', {
              title: this.$t('compute.text_18'),
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
                label: this.$t('compute.text_656'),
                permission: 'scalingpolicies_perform_enable',
                action: () => {
                  this.list.batchPerformAction('enable', null)
                },
                meta: () => ({
                  validate: this.list.selectedItems.length,
                }),
              },
              {
                label: this.$t('compute.text_569'),
                permission: 'scalingpolicies_perform_disable',
                action: () => {
                  this.list.batchPerformAction('disable', null)
                },
                meta: () => ({
                  validate: this.list.selectedItems.length,
                }),
              },
              {
                label: this.$t('compute.text_261'),
                permission: 'scalingpolicies_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('compute.text_261'),
                    onManager: this.onManager,
                  })
                },
                meta: (obj) => {
                  return {
                    validate: this.list.selectedItems.length && this.list.selectedItems.every(val => !val.enabled),
                  }
                },
              },
            ]
          },
          meta: () => ({
            validate: this.list.selectedItems.length,
          }),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    formatTriggerType (row) {
      const type = row.trigger_type
      const initStatus = ['creating', 'create_failed', 'init']
      if (initStatus.indexOf(row.status) > -1) {
        return '-'
      }
      // 告警策略
      if (type === 'alarm' && row.alarm) {
        const { indicator, operator, value, cumulate } = row.alarm
        const wrapperType = {
          lt: '<',
          gt: '>',
        }
        const unit = indicator === 'cpu' ? '%' : 'b/s'
        const cumulateTxt = this.$t('compute.text_968', [cumulate])
        return `${this.$t('flexGroupIndicator')[indicator]} ${wrapperType[operator]} ${value} ${unit}，${cumulateTxt}`
      }
      // 定时策略
      if (type === 'timing' && row.timer) {
        const timeTxt = this.$moment(row.timer.exec_time).format()
        return this.$t('compute.text_969', [timeTxt])
      }
      // 周期策略
      if (type === 'cycle' && row.cycle_timer) {
        const timer = row.cycle_timer
        const { hour, minute, start_time: startTime, end_time: endTime } = timer
        const typeTxt = this.$t('flexGroupCycleType')[timer.cycle_type]
        let itemsTxt = ''
        // 周
        if (timer.cycle_type === 'week' && timer.week_days.length > 0) {
          itemsTxt = '【' + timer.week_days.map(v => {
            return this.$t('flexGroupSubCycleTypeWeek')[v]
          }).join('|') + '】'
        }
        // 月
        if (timer.cycle_type === 'month') {
          itemsTxt = '【' + timer.month_days.map(v => {
            return this.$t('compute.text_927', [v])
          }).join('|') + '】'
        }
        let tiemStr = ''
        if (startTime && endTime) {
          tiemStr = this.$t('compute.text_970', [this.$moment(startTime).format('YYYY-MM-DD'), this.$moment(endTime).format('YYYY-MM-DD')])
        }
        return this.$t('compute.text_972', [typeTxt, itemsTxt, numerify(hour, '00'), numerify(minute, '00'), tiemStr])
      }
      return '-'
    },
  },
}
</script>
