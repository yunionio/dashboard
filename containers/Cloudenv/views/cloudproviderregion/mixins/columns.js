import { getEnabledTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'
import {
  getLastSyncCostTableColumn,
} from '../../cloudaccount/utils/columns'

export default {
  created () {
    this.columns = [
      {
        field: 'cloudregion',
        title: i18n.t('cloudenv.text_10'),
      },
      getEnabledTableColumn({ title: i18n.t('cloudenv.text_366') }),
      getLastSyncCostTableColumn(),
      {
        field: 'last_auto_sync',
        title: i18n.t('cloudenv.text_103'),
        slots: {
          default: ({ row }) => {
            // 同步时间始终展示时间，不展示「同步中」
            let time
            if (row.last_sync) {
              time = this.$moment(row.last_sync)
            }
            return time ? time.fromNow() : '-'
          },
        },
      },
      {
        field: 'last_sync_end_at',
        title: i18n.t('cloudenv.last.sync.end.at'),
        slots: {
          default: ({ row }) => {
            const time = this.$moment(row.last_sync_end_at)
            if (time) {
              return time.fromNow()
            }
            return '-'
          },
        },
      },
      {
        field: 'sync_status',
        title: i18n.t('cloudenv.text_354'),
        slots: {
          default: ({ row }) => {
            return [
              <status status={ row.sync_status } statusModule='cloudaccountSyncStatus' />,
            ]
          },
        },
      },
    ]
  },
}
