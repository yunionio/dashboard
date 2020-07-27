import { BAND_WIDTH_OPTION } from '../../../constants'
import i18n from '@/locales'

export const getBandwidthTableColumn = () => {
  return {
    field: 'bandwidth',
    title: i18n.t('network.text_195'),
    minWidth: 100,
    sortable: true,
    showOverflow: 'ellipsis',
    formatter: ({ cellValue }) => {
      const item = BAND_WIDTH_OPTION.find(val => val.value === `${cellValue}`)
      return item ? item.label : cellValue
    },
  }
}
