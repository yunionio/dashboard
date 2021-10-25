import { getEnabledTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      {
        field: 'cloudregion',
        title: i18n.t('cloudenv.text_10'),
      },
      getEnabledTableColumn({ title: i18n.t('cloudenv.text_366') }),
      {
        field: 'last_auto_sync',
        title: i18n.t('cloudenv.text_103'),
        slots: {
          default: ({ row }) => {
            if (row.sync_status !== 'idle') { // 表示正在同步中
              return [
                <status status={ row.sync_status } statusModule='cloudaccountSyncStatus' />,
              ]
            } else {
              let time
              if (row.last_sync) {
                time = this.$moment(row.last_sync)
              }
              return time ? time.fromNow() : '-'
            }
          },
        },
      },
      {
        field: 'last_sync_end_at',
        title: i18n.t('cloudenv.last.sync.end.at'),
        slots: {
          default: ({ row }) => {
            if (row.sync_status !== 'idle') { // 表示正在同步中
              return [
                <status status={ row.sync_status } statusModule='cloudaccountSyncStatus' />,
              ]
            }
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
