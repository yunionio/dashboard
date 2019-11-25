<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
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
          title: '实例名称',
        },
        {
          field: 'backup_mode',
          title: '备份类型',
          slots: {
            default: ({ row }) => {
              return BACKUP_TYPE[row.backup_mode]
            },
          },
        },
        {
          id: 'engine',
          title: '数据库引擎',
          slots: {
            default: ({ row }) => {
              return `${row.engine || ''} ${row.engine_version || ''}`
            },
          },
        },
        {
          id: 'backup_size_mb',
          title: '大小',
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
          slots: {
            default: ({ row }) => {
              return `${this.$moment(row.start_time).format()} / ${this.$moment(row.end_time).format()}`
            },
          },
        },
        {
          id: 'region',
          title: '区域',
          slots: {
            default: ({ row }) => {
              return row.region
            },
          },
        },
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
