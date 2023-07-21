import * as R from 'ramda'
import i18n from '@/locales'
import { ASSOCIATE_MAP } from '../constants'
import { BGP_TYPES_MAP } from '@/constants/network'

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

export const getIPWithBgpTypeTableColumn = ({ hidden } = {}) => {
  return {
    field: 'ip_addr',
    title: 'IP',
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        const ret = []
        const bgp = BGP_TYPES_MAP[row.bgp_type]?.label || row.bgp_type
        if (bgp && row.bgp_type === BGP_TYPES_MAP.BGP_PRO.value) {
          ret.push(
            <list-body-cell-wrap row={row} field="ip_addr" copy><span class="text-color-help">({ bgp })</span></list-body-cell-wrap>,
          )
        } else {
          ret.push(
            <list-body-cell-wrap row={row} field="ip_addr" copy></list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
    hidden: () => {
      return R.is(Function, hidden) ? hidden() : hidden
    },
  }
}
