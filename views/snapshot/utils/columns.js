import { STORAGE_TYPES } from '../constants'
import i18n from '@/locales'

export const getStorageTypeTableColumn = () => {
  return {
    field: 'storage_type',
    title: i18n.t('compute.text_380'),
    width: 80,
    formatter: ({ row }) => {
      return STORAGE_TYPES[row.storage_type] || row.storage_type || '-'
    },
  }
}
