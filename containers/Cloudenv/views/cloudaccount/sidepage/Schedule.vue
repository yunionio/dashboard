<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import {
  getStatusFilter,
} from '@/utils/common/tableFilter'
import {
  getStatusTableColumn,
  getEnabledTableColumn,
  getCycleTimerColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'ScheduledtasksListForCloudaccountSidepage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: Object,
    getParams: [Function, Object],
  },
  data () {
    return {
      columns: [
        {
          field: 'name',
          title: this.$t('table.title.name'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return row.name
            },
          },
        },
        getStatusTableColumn({ statusModule: 'scheduledtask', minWidth: 90 }),
        getEnabledTableColumn({ minWidth: 90 }),
        {
          field: 'operation',
          title: this.$t('cloudenv.text_425'),
          width: 80,
          showOverflow: 'title',
          formatter: ({ row }) => {
            return this.$t('cloudenvScheduledtaskRuleAction')[row.operation] || '-'
          },
        },
        getCycleTimerColumn(),
      ],
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'scheduledtasks',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('cloudenv.text_95'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          enabled: {
            label: this.$t('cloudenv.text_97'),
            dropdown: true,
            items: [
              { label: this.$t('cloudenv.text_334'), key: true },
              { label: this.$t('cloudenv.text_335'), key: false },
            ],
          },
          status: getStatusFilter('scheduledtask'),
        },
        hiddenColumns: ['resource_type', 'created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('cloudenv.text_97'), key: 'enabled' },
          { label: this.$t('cloudenv.text_98'), key: 'status' },
          { label: this.$t('cloudenv.text_427'), key: 'timer_desc' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
        ],
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          permission: 'scheduledtasks_create',
          action: () => {
            this.createDialog('ScheduledtaskCreateDialog', {
              data: [this.data],
              columns: this.columns,
              onManager: this.onManager,
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
                label: this.$t('cloudenv.text_334'),
                permission: 'scheduledtasks_perform_enable',
                action: () => {
                  this.list.batchPerformAction('enable', null, this.list.steadyStatus)
                },
                meta: () => {
                  const validate = this.list.selectedItems.length && this.list.selectedItems.every(item => !item.enabled)
                  return {
                    validate,
                    tooltip: !validate ? this.$t('cloudenv.text_429') : '',
                  }
                },
              },
              {
                label: this.$t('cloudenv.text_335'),
                permission: 'scheduledtasks_perform_disable',
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
                    tooltip: !validate ? this.$t('cloudenv.text_430') : '',
                  }
                },
              },
              {
                label: this.$t('cloudenv.text_108'),
                permission: 'scheduledtasks_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('cloudenv.text_108'),
                    name: this.$t('cloudenv.text_431'),
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
      singleActions: [
        {
          label: this.$t('cloudenv.text_334'),
          permission: 'scheduledtasks_perform_enable',
          action: (obj) => {
            this.createDialog('ScheduledtaskEnabledDialog', {
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: (obj) => {
            return {
              validate: !obj.enabled,
              tooltip: obj.enabled ? this.$t('cloudenv.text_455') : '',
            }
          },
        },
        {
          label: this.$t('cloudenv.text_335'),
          permission: 'scheduledtasks_perform_disable',
          action: (obj) => {
            this.createDialog('ScheduledtaskDisabledDialog', {
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: (obj) => {
            return {
              validate: obj.enabled,
              tooltip: !obj.enabled ? this.$t('cloudenv.text_456') : '',
            }
          },
        },
        {
          label: this.$t('cloudenv.text_108'),
          permission: 'scheduledtasks_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('cloudenv.text_108'),
              onManager: this.onManager,
              success: () => {
                this.destroySidePages()
              },
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>
