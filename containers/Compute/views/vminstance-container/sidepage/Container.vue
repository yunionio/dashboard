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
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => item.status !== 'starting')
              return ret
            })
            return ret
          },
        },
        // 停止
        {
          label: this.$t('compute.repo.stop'),
          action: () => {
            this.createDialog('VmShutDownDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => item.status === 'running')
              return ret
            })
            return ret
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.repo.start'),
          action: (obj) => {
            this.onManager('performAction', {
              steadyStatus: 'running',
              id: obj.id,
              managerArgs: {
                action: 'start',
              },
            })
          },
          meta: (obj) => {
            return {
              validate: obj.status !== 'starting',
            }
          },
        },
        {
          label: this.$t('compute.repo.stop'),
          action: (obj) => {
            this.createDialog('ContainerShutDownDialog', {
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: (obj) => {
            return {
              validate: obj.status === 'running',
            }
          },
        },
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
            return {
              validate: obj.status === 'running',
            }
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
