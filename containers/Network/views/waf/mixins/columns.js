// import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getRegionTableColumn,
  getProjectDomainTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
// import VueI18n from 'vue-i18n'
import i18n from '@/locales'
// import { getTagColor, getTagTitle } from '@/utils/common/tag'
export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row, '')}>{row.name}</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, resource: 'waf_instances', columns: () => this.columns, tipName: this.$t('network.waf') }),
      getStatusTableColumn({ statusModule: 'waf', vm: this }),
      {
        field: 'type',
        title: i18n.t('network.waf.type'),
        slots: {
          default: ({ row }) => {
            const ret = []
            const type = this.$getI18n(`network.waf.type.${row.type}`, row.type)
            ret.push(<div>{type}</div>)
            if (row.brand === 'Qcloud') {
              ret.push(<list-body-cell-wrap hide-field copy field="cname" row={row}>
                <span class='text-weak'>{row.cname}</span>
              </list-body-cell-wrap>)
            }
            return ret
          },
        },
        formatter: ({ row }) => {
          const ret = []
          const type = this.$getI18n(`network.waf.type.${row.type}`, row.type)
          ret.push(type)
          if (row.brand === 'Qcloud') {
            ret.push(row.cname)
          }
          return ret.join(',')
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn(),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
