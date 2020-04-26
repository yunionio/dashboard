import { getStatusTableColumn, getNameDescriptionTableColumn, getRegionTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
const BACKUP_TYPE = {
  automated: '自动',
  manual: '手动',
}

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
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
        field: 'engine',
        title: '数据库引擎',
        width: 100,
        slots: {
          default: ({ row }) => {
            return `${row.engine || ''} ${row.engine_version || ''}`
          },
        },
      },
      {
        field: 'backup_size_mb',
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
        field: 'start_time',
        title: '备份开始/结束时间',
        minWidth: 150,
        slots: {
          default: ({ row }) => {
            return `${this.$moment(row.start_time).format()} / ${this.$moment(row.end_time).format()}`
          },
        },
      },
      getRegionTableColumn(),
    ]
  },
}
