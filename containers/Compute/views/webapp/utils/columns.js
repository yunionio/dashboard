import i18n from '@/locales'
import { WEBAPP_TYPE } from '../constants'

export const getTypeTableColumn = () => {
  return {
    field: 'type',
    title: i18n.t('compute.webapp.type'),
    minWidth: 100,
    formatter: ({ row }) => {
      return WEBAPP_TYPE[row.type]?.label
    },
  }
}

export const getKindTableColumn = () => {
  return {
    field: 'kind',
    title: i18n.t('compute.webapp.kind'),
    minWidth: 100,
    formatter: ({ row }) => {
      return row.kind
    },
  }
}

export const getTechStackTableColumn = () => {
  return {
    field: 'tech_stack',
    title: i18n.t('compute.webapp.tech.stack'),
    minWidth: 100,
    formatter: ({ row }) => {
      return row.tech_stack
    },
  }
}
