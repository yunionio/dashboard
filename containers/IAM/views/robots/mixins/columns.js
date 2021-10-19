import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getProjectTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getTypeTableColumn,
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
      getStatusTableColumn({ statusModule: 'robot' }),
      getEnabledTableColumn(),
      getTypeTableColumn(),
      getProjectTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'robots' }),
      getCopyWithContentTableColumn({
        title: 'Webhook/URL',
        field: 'address',
      }),
    ]
  },
}
