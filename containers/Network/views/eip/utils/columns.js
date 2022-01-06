import i18n from '@/locales'
import { ASSOCIATE_MAP } from '../constants'

export const getAssociateNameTableColumn = ({ vm = {} } = {}) => {
  return {
    field: 'associate_name',
    title: i18n.t('network.text_197'),
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        if (vm.isPreLoad && !row.associate_name) return [<data-loading />]
        if (!row.associate_name) return '-'
        const associate = ASSOCIATE_MAP[row.associate_type]
        const text = `${row.associate_name}(${associate.name || '-'})`
        if (vm && associate) {
          return [
            <side-page-trigger permission={associate.permission} tab={associate.tab} name={associate.sidePage} id={row.associate_id} vm={vm}>{text}</side-page-trigger>,
          ]
        }
        return text
      },
    },
  }
}
