import * as R from 'ramda'
import { PREALLOCATION_OPTION_MAP, STORAGE_TYPES } from '@Compute/constants'
import i18n from '@/locales'

export const getUnusedTableColumn = ({ hidden, vm = {} } = {}) => {
  return {
    field: 'guest_count',
    title: i18n.t('table.title.disk_mounted'),
    width: 70,
    sortable: true,
    sortBy: 'order_by_guest_count',
    slots: {
      default: ({ row }, h) => {
        if (vm.isPreLoad && row.guest_count === undefined) return [<data-loading />]
        return row.guest_count >= 1 ? [<span class="success-color">{ i18n.t('compute.text_464') }</span>] : [<span class="warning-color">{ i18n.t('compute.text_281') }</span>]
      },
    },
    formatter: ({ row }) => {
      return row.guest_count >= 1 ? i18n.t('compute.text_464') : i18n.t('compute.text_281')
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getStorageTypeTableColumn = ({ hidden } = {}) => {
  return {
    field: 'storage_type',
    title: i18n.t('storage.text_38'),
    width: 100,
    formatter: ({ row }) => {
      if (row.provider && STORAGE_TYPES[row.provider.toLowerCase()] && STORAGE_TYPES[row.provider.toLowerCase()][row.storage_type]) {
        return STORAGE_TYPES[row.provider.toLowerCase()][row.storage_type].label || row.storage_type
      }
      return row.storage_type
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}

export const getPreallocationTableColumn = () => {
  return {
    field: 'preallocation',
    title: i18n.t('compute.preallocation'),
    width: 170,
    slots: {
      default: ({ row }) => {
        return PREALLOCATION_OPTION_MAP[row.preallocation]?.label || '-'
      },
    },
    formatter: ({ row }) => row.preallocation ? PREALLOCATION_OPTION_MAP[row.preallocation].label : '-',
  }
}
