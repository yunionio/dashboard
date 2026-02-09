import i18n from '@/locales'
import { BAND_WIDTH_OPTION } from '../../../constants'

export const getBandwidthTableColumn = () => {
  return {
    field: 'bandwidth',
    title: i18n.t('network.text_195'),
    minWidth: 100,
    sortable: true,
    showOverflow: 'ellipsis',
    formatter: ({ row }) => {
      const item = BAND_WIDTH_OPTION.find(val => val.value === `${row.bandwidth}`)
      return item ? item.label : row.bandwidth
    },
  }
}

export const getMTUTableColumn = () => {
  return {
    field: 'mtu',
    title: 'MTU',
    minWidth: 50,
    sortable: true,
    showOverflow: 'ellipsis',
    formatter: ({ row }) => {
      return row.mtu || '-'
    },
  }
}

export const getHostsTableColumn = () => {
  return {
    field: 'hosts',
    title: i18n.t('network.wire.hosts'),
    type: 'expand',
    width: 100,
    slots: {
      default: ({ row }, h) => {
        return row.host_count || 0
      },
      content: ({ row }, h) => {},
    },
  }
}
