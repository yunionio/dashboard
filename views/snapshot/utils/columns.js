import { STORAGE_TYPES } from '../constants'

export const getStorageTypeTableColumn = () => {
  return {
    field: 'storage_type',
    title: '存储类型',
    width: 80,
    formatter: ({ row }) => {
      return STORAGE_TYPES[row.storage_type] || row.storage_type || '-'
    },
  }
}
