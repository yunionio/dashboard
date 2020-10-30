import * as R from 'ramda'
import { CATEGORY_LABEL_MAP, categories, POLICIES_VALUE_MAP } from '../config'
import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        edit: false,
        hideField: true,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'category',
        title: i18n.t('cloudenv.text_502'),
        formatter: ({ row, cellValue }) => {
          return CATEGORY_LABEL_MAP[cellValue]
        },
      },
      {
        field: 'policies',
        title: i18n.t('cloudenv.text_501'),
        width: 220,
        type: 'expand',
        slots: {
          default: ({ row }) => {
            const len = Object.keys(row.policies).length
            let actionType = ''
            R.forEach((item) => {
              if (item.key === row.category) actionType = item.action
            }, categories)
            return i18n.t('cloudenv.text_557', [actionType, len])
          },
          content: ({ row }, h) => {
            const ret = []
            R.forEachObjIndexed((value, key) => {
              ret.push(<a-tag class='mb-2'>{ POLICIES_VALUE_MAP[row.category][key] }{ value === true ? '' : '：' + value }</a-tag>)
            }, row.policies)
            return ret
          },
        },
      },
    ]
  },
}
