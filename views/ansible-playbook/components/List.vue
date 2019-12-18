<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import { getStatusTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AnsiblePlaybookList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'ansibleplaybooks',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          status: {
            label: '实例状态',
            dropdown: true,
            multiple: true,
            items: (function (t) {
              const _items = []
              const statusItems = t.$t('status.ansiblePlaybook')
              for (let key in statusItems) {
                _items.push({
                  key,
                  label: statusItems[key],
                })
              }
              return _items
            })(this),
            filter: true,
            formatter: val => {
              return `status.in(${val.join(',')})`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          isNameEdit: false,
          showDesc: false,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.sidePageTriggerHandle(row.id, 'AnsiblePlaybookSidepage')}>{row.name}</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({ statusModule: 'ansiblePlaybook', title: '上一次执行状态' }),
        getTimeTableColumn({
          field: 'start_time',
          title: '开始时间',
        }),
        getTimeTableColumn({
          field: 'end_time',
          title: '结束时间',
        }),
        getProjectTableColumn(),
      ],
      singleActions: [
        {
          label: '重新执行',
          action: (obj) => {
            this.list.onManager('performAction', {
              steadyStatus: ['succeeded', 'failed'],
              id: obj.id,
              managerArgs: {
                action: 'run',
              },
            })
          },
          meta: obj => {
            const { status } = obj
            const isRun = status === 'running'
            return {
              validate: !isRun,
              tooltip: isRun && '执行中状态下不支持此操作',
            }
          },
        },
        {
          label: '终止执行',
          action: (obj) => {
            this.createDialog('AnsiblePlayBookStopDialog', {
              title: '终止执行',
              data: [obj],
              list: this.list,
              columns: this.columns,
            })
          },
          meta: obj => {
            const { status } = obj
            const isRun = status === 'running'
            return {
              validate: isRun,
              tooltip: !isRun && '仅在执行中状态下支持此操作',
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
}
</script>
