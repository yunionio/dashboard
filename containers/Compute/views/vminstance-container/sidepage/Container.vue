<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getStatusFilter,
} from '@/utils/common/tableFilter'

export default {
  name: 'ContainerListForVmContainerInstanceSidepage',
  mixins: [ListMixin, WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'containers',
        getParams: {
          guest_id: this.resId,
        },
        steadyStatus: Object.values(expectStatus.container).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('container'),
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'name',
          title: this.$t('common.name'),
          hideField: true,
          message: (row) => {
            return row.name
          },
          slotCallback: (row) => {
            return row.name
          },
        }),
        getStatusTableColumn({ statusModule: 'container' }),
        {
          field: 'image',
          title: this.$t('compute.pod-image'),
          width: 350,
          formatter: ({ row }) => {
            return row.spec?.image || '-'
          },
        },
        {
          field: 'env',
          title: this.$t('compute.repo.env_variables'),
          minWidth: 200,
          slots: {
            default: ({ row }, h) => {
              if (!row.spec.envs || !row.spec.envs.length) return '-'
              return row.spec.envs.map(v => {
                return (
                  <a-tooltip title={`${v.key}: ${v.value}`}>
                    <a-tag class="d-block text-truncate mb-1" style="max-width: 400px;">{v.key}: {v.value}</a-tag>
                  </a-tooltip>
                )
              })
            },
          },
        },
        {
          field: 'command',
          title: this.$t('compute.repo.command'),
          minWidth: 200,
          slots: {
            default: ({ row }, h) => {
              const command = row.spec?.command || []
              return command.join(' ') || '-'
            },
          },
        },
        {
          field: 'args',
          title: this.$t('compute.repo.command.params'),
          minWidth: 200,
          slots: {
            default: ({ row }, h) => {
              const args = row.spec?.args
              return args?.length ? `[${args}]` : '-'
            },
          },
        },
      ],
      groupActions: [
        // 启动
        {
          label: this.$t('compute.repo.start'),
          action: () => {
            const ids = this.list.selectedItems.map(item => item.id)
            this.list.onManager('batchPerformAction', {
              steadyStatus: 'running',
              id: ids,
              managerArgs: {
                action: 'start',
              },
            })
          },
          meta: () => {
            const ret = { validate: true, tooltip: null }
            if (this.list.selectedItems.length === 0) {
              ret.validate = false
              return ret
            }
            const isStatusOk = this.list.selectedItems.every(item => ['exited'].includes(item.status))
            if (!isStatusOk) {
              ret.validate = false
              return ret
            }
            return ret
          },
        },
        // 停止
        {
          label: this.$t('compute.repo.stop'),
          action: () => {
            this.createDialog('ContainerShutDownDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = { validate: true, tooltip: null }
            if (this.list.selectedItems.length === 0) {
              ret.validate = false
              return ret
            }
            const isStatusOk = this.list.selectedItems.every(item => ['running'].includes(item.status))
            if (!isStatusOk) {
              ret.validate = false
              return ret
            }
            return ret
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('table.action.modify'),
          action: (obj) => {
            this.createDialog('ContainerUpdateDialog', {
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: (obj) => {
            const ret = { validate: true }
            if (obj.status !== 'exited') {
              ret.tooltip = this.$t('compute.repo.helper.modify')
              ret.validate = false
            }
            return ret
          },
        },
        {
          label: this.$t('common.more'),
          actions: (obj) => {
            return [
              {
                label: this.$t('compute.repo.start'),
                action: () => {
                  this.onManager('performAction', {
                    steadyStatus: 'running',
                    id: obj.id,
                    managerArgs: {
                      action: 'start',
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: obj.status === 'exited',
                  }
                },
              },
              {
                label: this.$t('compute.repo.stop'),
                action: () => {
                  this.createDialog('ContainerShutDownDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: obj.status === 'running',
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
    this.list.fetchData()
  },
  methods: {},
}
</script>
