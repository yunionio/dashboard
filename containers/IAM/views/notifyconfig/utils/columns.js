import i18n from '@/locales'
import { contactMap } from '@/constants'

export const getConfigTypeTableColumn = () => {
  return {
    title: i18n.t('system.text_48'),
    field: 'type',
    minWidth: 120,
    formatter: ({ row }) => {
      return contactMap[row.type]?.label || row.type
    },
  }
}

export const getAttirubuteTableColumn = ({ vm = {} } = {}) => {
  return {
    title: i18n.t('bill.text_219'),
    field: 'attribution',
    width: 120,
    slots: {
      default: ({ row }, h) => {
        const attribution = row.attribution
        if (vm.isPreLoad && !row.project_domain) return [<data-loading />]
        if (attribution === 'domain') return `${row.project_domain}${i18n.t(`shareScope.${attribution}`)}`
        return i18n.t(`shareScope.${attribution}`) || attribution
      },
    },
  }
}
