import { NOTIFY_TOPIC_TYPES_MAP, NOTIFY_TOPIC_NAMES_MAP } from '@IAM/constants'
import {
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'

import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      {
        title: i18n.t('system.notify.topic.name'),
        field: 'name',
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            return [
              <list-body-cell-wrap copy row={row} field='name' list={this.list} hideField addLock={ false } addBackup={ false }>
                <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ NOTIFY_TOPIC_NAMES_MAP[row.name] || row.name }</side-page-trigger>
              </list-body-cell-wrap>,
            ]
          },
        },
      },
      {
        title: i18n.t('system.notify.topic.type'),
        field: 'type',
        sortable: true,
        minWidth: 100,
        showOverflow: 'title',
        formatter: ({ row }) => {
          return NOTIFY_TOPIC_TYPES_MAP[row.type] ? NOTIFY_TOPIC_TYPES_MAP[row.type].label : '-'
        },
      },
      getEnabledTableColumn(),
    ]
  },
}
