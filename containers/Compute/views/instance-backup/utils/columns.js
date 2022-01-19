import i18n from '@/locales'
import { sizestr } from '@/utils/utils'
import {
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'

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

export const getGuestTableColumn = () => {
  return {
    field: 'guest',
    title: i18n.t('compute.text_91'),
    slot: {
      default: (row) => {
        return row.guest
      },
    },
  }
}

export const getOsTypeTableColumn = () => {
  return {
    field: 'os_type',
    title: i18n.t('table.title.os'),
    width: 50,
    slots: {
      default: ({ row }, h) => {
        let name = row.os_type || ''
        const tooltip = row.os_type

        if (name.includes('Windows') || name.includes('windows')) {
          name = 'Windows'
        } else if (name.includes('Linux') || name.includes('linux')) {
          name = 'Linux'
        }
        return [
          <SystemIcon tooltip={ tooltip } name={ name } />,
        ]
      },
    },
  }
}

export const getSizeMbTableColumn = () => {
  return {
    field: 'size_mb',
    title: i18n.t('compute.backup_size'),
    minWidth: 70,
    slots: {
      default: ({ row }, h) => {
        return sizestr(row.size_mb, 'M', 1024)
      },
    },
  }
}
