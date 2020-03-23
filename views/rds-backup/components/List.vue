<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getNameFilter, getFilter, getStatusFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
const BACKUP_TYPE = {
  automated: '自动',
  manual: '手动',
}
export default {
  name: 'RDSBackupList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    params: {
      type: Object,
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'dbinstancebackups',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.rdsBackup).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('rdsBackup'),
          dbinstance: getFilter({
            field: 'dbinstance',
            title: '实例名称',
          }),
          engine: getFilter({
            field: 'engine',
            title: '数据库引擎',
            multiple: true,
            items: [
              { label: 'MySQL', key: 'MySQL' },
              { label: 'PostgreSQL', key: 'PostgreSQL' },
              { label: 'SQLServer', key: 'SQLServer' },
            ],
          }),
          backup_mode: getFilter({
            field: 'backup_mode',
            title: '备份类型',
            items: Object.keys(BACKUP_TYPE).map(key => {
              return { label: BACKUP_TYPE[key], key }
            }),
          }),
        },
      }),
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('RDSBackupCreate', {
              rdsItem: this.data,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '批量操作',
          actions: () => {
            return [
              {
                label: '同步状态',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
              },
              {
                label: '删除',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    name: '备份',
                    title: '删除备份',
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selected.length,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('rds-backup-detail')
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'RDSBackupSidePage', {
        id: row.id,
        resource: 'dbinstancebackups',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.rdsBackup).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
