import i18n from '@/locales'
import {
  ROBOT_TYPE,
} from '../constants'

export const getTypeTableColumn = () => {
  return {
    title: i18n.t('system.text_48'),
    field: 'type',
    showOverflow: 'ellipsis',
    minWidth: 100,
    slots: {
      default: ({ row }) => {
        return ROBOT_TYPE[row.type]?.label || '-'
      },
    },
  }
}
