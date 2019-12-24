<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { getStatusTableColumn, getNameDescriptionTableColumn, getRegionTableColumn } from '@/utils/common/tableColumn'
import { getNameFilter, getFilter, getStatusFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { sizestr } from '@/utils/utils'
const BACKUP_TYPE = {
  automated: '自动',
  manual: '手动',
}
export default {
  name: 'RDSBackupList',
  mixins: [WindowsMixin],
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
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          addLock: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.sidePageTriggerHandle(row.id, 'RDSBackupSidePage')}>{row.name}</side-page-trigger>
            )
          },
        }),
        {
          field: 'dbinstance',
          minWidth: 100,
          title: '实例名称',
          showOverflow: 'ellipsis',
        },
        {
          field: 'backup_mode',
          title: '备份类型',
          width: 100,
          slots: {
            default: ({ row }) => {
              return BACKUP_TYPE[row.backup_mode]
            },
          },
        },
        {
          id: 'engine',
          title: '数据库引擎',
          width: 100,
          slots: {
            default: ({ row }) => {
              return `${row.engine || ''} ${row.engine_version || ''}`
            },
          },
        },
        {
          id: 'backup_size_mb',
          title: '大小',
          width: 70,
          slots: {
            default: ({ row }) => {
              return sizestr(row.backup_size_mb, 'M', 1024)
            },
          },
        },
        getStatusTableColumn({ statusModule: 'rdsBackup' }),
        // getBrandTableColumn(),
        {
          title: '备份开始/结束时间',
          minWidth: 150,
          slots: {
            default: ({ row }) => {
              return `${this.$moment(row.start_time).format()} / ${this.$moment(row.end_time).format()}`
            },
          },
        },
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('RDSBackupCreate', {
              list: this.list,
              rdsItem: this.data,
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
              title: '删除备份',
              list: this.list,
              name: '备份',
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
      singleActions: [
        {
          label: '恢复',
          action: (obj) => {
            this.createDialog('RDSBackupRecovery', {
              title: '恢复',
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: (obj) => {
            return {
              validate: obj.status === 'ready',
              tooltip: obj.status !== 'ready' ? '正常状态下的备份，才可恢复' : '',
            }
          },
        },
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              name: '备份',
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('rds-backup-detail')
  },
}
</script>
