import { BAND_WIDTH_OPTION } from '../../../constants'

export const getBandwidthTableColumn = () => {
  return {
    field: 'bandwidth',
    title: '带宽',
    minWidth: 100,
    sortable: true,
    showOverflow: 'ellipsis',
    formatter: ({ cellValue }) => {
      const item = BAND_WIDTH_OPTION.find(val => val.value === `${cellValue}`)
      return item ? item.label : cellValue
    },
  }
}
