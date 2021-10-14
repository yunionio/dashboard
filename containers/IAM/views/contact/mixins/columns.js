import {
  getTimeTableColumn,
  getEnabledTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'

import i18n from '@/locales'
import {
  getMobileTableColumn,
  getEmailTableColumn,
  getVerifiedContactTypesTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      {
        title: i18n.t('system.text_143'),
        field: 'name',
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            return [
              <list-body-cell-wrap copy row={row} field='name' list={this.list} hideField addLock={ false } addBackup={ false }>
                <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
              </list-body-cell-wrap>,
            ]
          },
        },
      },
      getEnabledTableColumn(),
      getMobileTableColumn(),
      getEmailTableColumn(),
      getVerifiedContactTypesTableColumn({ vm: this }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
