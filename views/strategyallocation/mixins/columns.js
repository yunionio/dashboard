import * as R from 'ramda'
import { CATEGORY_LABEL_MAP, categories, POLICIES_VALUE_MAP } from '@Cloudenv/views/strategydefinition/config'
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
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.policy_name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'category',
        title: i18n.t('cloudenv.text_502'),
        formatter: ({ cellValue }) => {
          return CATEGORY_LABEL_MAP[cellValue]
        },
      },
      {
        field: 'policy',
        title: i18n.t('cloudenv.text_501'),
        width: 220,
        type: 'expand',
        slots: {
          default: ({ row }) => {
            const len = Object.keys(row.policy).length
            let actionType = ''
            R.forEach((item) => {
              if (item.key === row.category) actionType = item.action
            }, categories)
            return actionType + ':' + len + i18n.t('cloudenv.text_24')
          },
          content: ({ row }, h) => {
            const ret = []
            R.forEachObjIndexed((value, key) => {
              ret.push(<a-tag class='mb-2'>{ POLICIES_VALUE_MAP[row.category][key] }{ value === true ? '' : '：' + value }</a-tag>)
            }, row.policy)
            return ret
          },
        },
      },
      {
        field: 'scope',
        title: i18n.t('cloudenv.text_503'),
        formatter: ({ row }) => {
          let ret = i18n.t('cloudenv.text_504')
          if (row.project_domain) {
            ret = i18n.t('cloudenv.text_505') + row.project_domain
          }
          if (row.project) {
            ret += i18n.t('cloudenv.text_506') + row.project
          }
          return ret
        },
      },
    ]
  },
}
