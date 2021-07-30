import {
  getStatusTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getRegionTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import {
  getTypeTableColumn,
  getKindTableColumn,
  getTechStackTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      {
        title: this.$t('system.text_101'),
        field: 'name',
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            return [
              <list-body-cell-wrap copy row={row} field='name' hideField>
                <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
              </list-body-cell-wrap>,
            ]
          },
        },
      },
      getStatusTableColumn({ statusModule: 'webapp' }),
      getTypeTableColumn(),
      getKindTableColumn(),
      getTechStackTableColumn(),
      getBrandTableColumn(),
      getAccountTableColumn(),
      getRegionTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
