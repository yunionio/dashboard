import { STORAGE_TYPES } from '../constants'
import i18n from '@/locales'

export const getStorageTypeTableColumn = () => {
  return {
    field: 'storage_type',
    title: i18n.t('table.title.storage_type'),
    width: 80,
    formatter: ({ row }) => {
      return STORAGE_TYPES[row.storage_type] || row.storage_type || '-'
    },
  }
}
