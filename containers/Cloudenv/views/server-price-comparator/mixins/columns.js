import { serverTypeMap } from '../constants'
import {
  getRegionTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import { BUY_DURATIONS_OPTIONS } from '@Compute/constants'

const parseDuration = (s) => {
  const m = /(\d)+(M)/
  const y = /(\d)+(Y)/
  let duration = 1
  if (m.exec(s)) {
    duration = parseInt(m.exec(s)[1])
  } else if (y.exec(s)) {
    duration = parseInt(y.exec(s)[1]) * 12
  }
  return duration
}

const parseFee = (fee) => {
  const m = new RegExp(/(\D)(\d*\.?\d*)/).exec(fee)
  const currency = m && m[1] ? m[1] : ''
  const price = m && m[2] ? parseFloat(m[2]) : 0
  return [currency, price]
}

export default {
  created () {
    const columns = [
      {
        field: 'type',
        title: i18n.t('table.title.obj_type'),
        minWidth: 50,
        slots: {
          default: ({ row }) => {
            return serverTypeMap[row.type]
          },
        },
      },
      {
        field: 'config',
        title: i18n.t('table.title.flavor'),
        showOverflow: 'ellipsis',
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            return row.config || '-'
          },
        },
      },
      {
        field: 'systemDisk',
        title: i18n.t('compute.text_49'),
        showOverflow: 'ellipsis',
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            return row.systemDisk || '-'
          },
        },
      },
      {
        field: 'dataDisk',
        title: i18n.t('compute.text_50'),
        showOverflow: 'ellipsis',
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            if (parseInt(row.dataDisk) === 0) return '-'
            return row.dataDisk
          },
        },
      },
      getBrandTableColumn(),
      getRegionTableColumn(),
      {
        field: 'billing_type',
        title: i18n.t('compute.text_498'),
        minWidth: 50,
        slots: {
          default: ({ row }, h) => {
            const ret = []
            if (row.billing_type === 'postpaid') {
              ret.push(<div style={{ color: '#0A1F44' }}>{i18n.t('billingType.postpaid')}</div>)
            } else if (row.billing_type === 'prepaid') {
              ret.push(<div style={{ color: '#0A1F44' }}>{i18n.t('billingType.prepaid')}</div>)
            }
            return ret
          },
        },
      },
      {
        field: 'count',
        title: i18n.t('cloudenv.buy_num'),
        minWidth: 50,
        slots: {
          default: ({ row }) => {
            return `${row.count}${this.$t('common_62')}`
          },
        },
      },
      {
        field: 'duration',
        title: i18n.t('compute.text_1230'),
        minWidth: 50,
        slots: {
          default: ({ row }) => {
            const curObj = BUY_DURATIONS_OPTIONS.find(v => v.value === row.duration)
            return curObj?.label || i18n.t('compute.text_139')
          },
        },
      },
      {
        field: 'fee',
        title: i18n.t('common_419'),
        minWidth: 50,
        slots: {
          default: ({ row }, h) => {
            return [
              <div style={{ color: '#f5222d', fontSize: '14px' }}>{ row.fee }</div>,
            ]
          },
        },
      },
      {
        field: 'fee',
        title: i18n.t('cloudenv.month_expense'),
        minWidth: 50,
        slots: {
          default: ({ row }, h) => {
            const d = parseDuration(row.duration)
            const [c, p] = parseFee(row.fee)
            const fee = row.billing_type === 'postpaid' ? p * 24 * 30 : p / d
            return [
              <div style={{ color: '#f5222d', fontSize: '14px' }}>{ `${c}${fee.toFixed(2)}` }</div>,
            ]
          },
        },
      },
      {
        field: 'fee',
        title: i18n.t('cloudenv.year_expense'),
        minWidth: 50,
        slots: {
          default: ({ row }, h) => {
            const d = parseDuration(row.duration)
            const [c, p] = parseFee(row.fee)
            const fee = row.billing_type === 'postpaid' ? p * 24 * 30 * 12 : p * 12 / d
            return [
              <div style={{ color: '#f5222d', fontSize: '14px' }}>{ `${c}${fee.toFixed(2)}` }</div>,
            ]
          },
        },
      },
    ]
    if (this.hideColumnFields) {
      this.columns = columns.filter((column) => { return !this.hideColumnFields.includes(column.field) })
    } else {
      this.columns = columns
    }
  },
}
