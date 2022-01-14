import i18n from '@/locales'
import { sizestr } from '@/utils/utils'
import {
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import { DISK_TYPES } from '../constants'

export const getBackupSizeTableColumn = () => {
  return {
    field: 'backup_size',
    title: i18n.t('compute.backup_size'),
    minWidth: 70,
    slots: {
      default: ({ row }, h) => {
        return sizestr(row.backup_size, 'M', 1024)
      },
    },
  }
}

export const getSizeMbTableColumn = () => {
  return {
    field: 'size_mb',
    title: i18n.t('compute.disk_size'),
    minWidth: 70,
    slots: {
      default: ({ row }, h) => {
        return sizestr(row.size_mb, 'M', 1024)
      },
    },
  }
}

export const getDiskTypeTableColumn = () => {
  return {
    field: 'disk_type',
    title: i18n.t('table.title.disk_type'),
    width: 70,
    formatter: ({ row }) => {
      return DISK_TYPES[row.disk_type] || row.disk_type
    },
  }
}

export const getDiskNameTableColumn = () => {
  return getCopyWithContentTableColumn({
    field: 'disk_name',
    title: i18n.t('res.disk'),
    hideField: true,
    slotCallback: (row) => {
      return row.disk_name
    },
  })
}

export const getBackupStorageNameTableColumn = () => {
  return getCopyWithContentTableColumn({
    field: 'backup_storage_name',
    title: i18n.t('compute.backup_storage'),
    hideField: true,
    slotCallback: (row) => {
      return row.backup_storage_name
    },
  })
}
