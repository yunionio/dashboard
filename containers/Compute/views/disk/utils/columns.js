import i18n from '@/locales'
import { STORAGE_TYPES } from '@Storage/constants'

export const getUnusedTableColumn = ({ hidden, vm = {} } = {}) => {
  return {
    field: 'unused',
    title: i18n.t('table.title.disk_mounted'),
    width: 70,
    slots: {
      default: ({ row }, h) => {
        if (vm.isPreLoad && row.guest_count === undefined) return [<data-loading />]
        return row.guest_count >= 1 ? [<span class="success-color">{ i18n.t('compute.text_464') }</span>] : [<span class="warning-color">{ i18n.t('compute.text_281') }</span>]
      },
    },
    hidden,
  }
}

export const getStorageTypeTableColumn = () => {
  return {
    field: 'storage_type',
    title: i18n.t('storage.text_38'),
    width: 100,
    formatter: ({ row }) => {
      return STORAGE_TYPES[row.storage_type] || row.storage_type
    },
  }
}
