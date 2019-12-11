<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { weekOptions, timeOptions } from '../constants'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SnapshotPolicyList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'VmSnapshotPolicyList',
        resource: 'snapshotpolicies',
        steadyStatus: Object.values(expectStatus.snapshotpolicy).flat(),
        getParams: {
          details: true,
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'SnapshotPolicySidePage', { type: this.type }) }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({ statusModule: 'snapshotpolicy' }),
        {
          filed: 'binding_disk_count',
          title: '关联硬盘数量',
          width: 120,
          formatter: ({ row }) => {
            return row.binding_disk_count
          },
        },
        {
          filed: 'repeat_weekdays',
          title: '策略详情',
          minWidth: 180,
          formatter: ({ row }) => {
            let text = ''
            if (row.repeat_weekdays && row.repeat_weekdays.length) {
              text += '每' + row.repeat_weekdays.map(item => weekOptions[item - 1]).join('、')
            }
            if (row.time_points && row.time_points.length) {
              text += '; ' + row.time_points.map(item => timeOptions[item]).join('、')
            }
            if (text) {
              text += '自动创建快照'
            }
            return text
          },
        },
        getTimeTableColumn(),
        getProjectTableColumn(),
      ],
      groupActions: [
        {
          label: '删除',
          permission: 'snapshotpolicies_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
              title: '删除',
            })
          },
          meta: () => {
            const ret = {
              validate: this.list.selected.length,
              tooltip: null,
            }
            if (this.list.selectedItems.some(item => !item.can_delete)) {
              ret.validate = false
              return ret
            }
            return ret
          },
        },
      ],
      singleActions: [
        {
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
          meta: obj => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('snapshot-policy-detail')
    this.list.fetchData()
  },
}
</script>
