import * as R from 'ramda'
import i18n from '@/locales'

export const getAccessUrlTableColumn = () => {
  return {
    field: 'access_url',
    title: '环境',
    minWidth: 100,
    showOverflow: 'ellipsis',
    slots: {
      default: ({ row }, h) => {
        if (!row.access_url) return '-'
        let txt
        Object.keys(i18n.t('cloudAccountAccessType')).forEach(k => {
          if (row.access_url.indexOf(k) > -1) {
            txt = i18n.t('cloudAccountAccessType')[k]
          }
        })
        return txt ||
        [
          <a class="link-color" target="_blank" href={ row.access_url }>{ row.access_url }</a>,
        ]
      },
    },
  }
}

export const getBalanceTableColumn = () => {
  return {
    field: 'balance',
    title: '余额',
    minWidth: 70,
    showOverflow: 'ellipsis',
    formatter: ({ row }) => {
      if (R.isNil(row.balance)) {
        return '-'
      }
      return row.balance
    },
  }
}

export const getGuestCountTableColumn = () => {
  return {
    field: 'guest_count',
    title: '虚拟机',
    width: 60,
  }
}

export const getHostCountTableColumn = () => {
  return {
    field: 'host_count',
    title: '宿主机',
    minWidth: 70,
  }
}
