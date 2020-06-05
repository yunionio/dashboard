<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
// import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
// import expectStatus from '@/constants/expectStatus'

export default {
  name: 'ScheduledtasksList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'scheduledtasks',
        getParams: { details: true },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '启用状态', key: 'enabled' },
          { label: '状态', key: 'status' },
          { label: '操作动作', key: 'operation' },
          { label: '资源绑定', key: 'label_type' },
          { label: '策略详情', key: 'timer_desc' },
          { label: '创建时间', key: 'created_at' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.$router.push({
              path: '/scheduledtask/create',
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: '启用',
                action: () => {
                  this.list.batchPerformAction('enable', null, this.list.steadyStatus)
                },
                meta: () => {
                  const validate = this.list.selectedItems.length && this.list.selectedItems.every(item => !item.enabled)
                  return {
                    validate,
                    tooltip: !validate ? '请选择已经禁用的定时任务' : '',
                  }
                },
              },
              {
                label: '禁用',
                action: () => {
                  this.createDialog('ScheduledtaskDisabledDialog', {
                    columns: this.columns,
                    data: this.list.selectedItems,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const validate = this.list.selectedItems.length && this.list.selectedItems.every(item => item.enabled)
                  return {
                    validate,
                    tooltip: !validate ? '请选择已经启用的定时任务' : '',
                  }
                },
              },
              {
                label: '删除',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    name: '定时任务',
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
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('scheduledtask-detail')
    this.list.fetchData()
    this.$bus.$on('ScheduledtasksListSingleRefresh', args => {
      this.list.singleRefresh(...args)
    }, this)
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ScheduledtaskSidePage', {
        id: row.id,
        resource: 'scheduledtasks',
        getParams: { details: true },
      }, {
        list: this.list,
      })
    },
  },
}
</script>
