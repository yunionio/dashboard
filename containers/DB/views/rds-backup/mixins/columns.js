import { getStatusTableColumn, getNameDescriptionTableColumn, getRegionTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
const BACKUP_TYPE = {
  automated: i18n.t('db.text_33'),
  manual: i18n.t('db.text_34'),
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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'dbinstancebackup', columns: () => this.columns }),
      {
        field: 'dbinstance',
        minWidth: 100,
        title: i18n.t('db.text_35'),
        showOverflow: 'ellipsis',
      },
      {
        field: 'backup_mode',
        title: i18n.t('db.text_36'),
        width: 100,
        slots: {
          default: ({ row }) => {
            return BACKUP_TYPE[row.backup_mode]
          },
        },
      },
      {
        field: 'engine',
        title: i18n.t('db.text_57'),
        width: 100,
        slots: {
          default: ({ row }) => {
            return `${row.engine || ''} ${row.engine_version || ''}`
          },
        },
      },
      {
        field: 'db_names',
        title: i18n.t('db.text_232'),
        width: 100,
        slots: {
          default: ({ row }) => {
            return `${row.engine || ''} ${row.engine_version || ''}`
          },
        },
      },
      {
        field: 'backup_method',
        title: i18n.t('db.text_371'),
        width: 100,
        slots: {
          default: ({ row }) => {
            const map = {
              Logical: i18n.t('db.text_372'),
              Physical: i18n.t('db.text_373'),
              Snapshot: i18n.t('db.text_374'),
            }
            return map[row.backup_method]
          },
        },
      },
      {
        field: 'backup_size_mb',
        title: i18n.t('db.text_38'),
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
        title: i18n.t('db.text_39'),
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
