import * as R from 'ramda'
import i18n from '@/locales'
import { ASSOCIATE_MAP } from '../constants'

export const getAssociateNameTableColumn = ({ vm = {}, hidden } = {}) => {
  return {
    field: 'associate_name',
    title: i18n.t('network.text_197'),
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        if (vm.isPreLoad && !row.associate_name) return [<data-loading />]
        const { associate_name, associate_id, associate_type } = row
        if (vm && associate_type) {
          const associate = ASSOCIATE_MAP[associate_type] || {}
          const text = `${associate_name || '-'}(${associate.name || '-'})`
          if (associate_name && associate_id) {
            return [
              <side-page-trigger permission={associate.permission} tab={associate.tab} name={associate.sidePage} id={associate_id} vm={vm}>{text}</side-page-trigger>,
            ]
          } else {
            return `${associate_name || '-'}${associate.name ? `(${associate.name})` : ''}`
          }
        }
        return '-'
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}
