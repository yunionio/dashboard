import {
  getBrandTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getCopyWithContentTableColumn,
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getTimeTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import {
  getAccessUrlTableColumn,
  getBalanceTableColumn,
  getGuestCountTableColumn,
  getHostCountTableColumn,
  getPublicScopeTableColumn,
  getResourceMatchProjectTableColumn,
  getLastSyncCostTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: this.$t('common.text00042') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getAccessUrlTableColumn(),
      getStatusTableColumn({ vm: this, statusModule: 'cloudaccount' }),
      getEnabledTableColumn(),
      getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: i18n.t('cloudenv.text_93'), field: 'health_status', minWidth: 90 }),
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'cloudaccounts',
        columns: () => this.columns,
        tipName: this.$t('cloudenv.text_12'),
      }),
      getBalanceTableColumn(),
      getBrandTableColumn(),
      getCopyWithContentTableColumn({ field: 'account', title: i18n.t('cloudenv.text_94') }),
      getHostCountTableColumn(),
      getGuestCountTableColumn(),
      getLastSyncCostTableColumn(),
      // getEnabledTableColumn({ field: 'enable_auto_sync', title: i18n.t('cloudenv.text_83'), minWidth: 90 }),
      {
        field: 'last_sync',
        title: i18n.t('cloudenv.text_103'),
        minWidth: 70,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            if (row.sync_status !== 'idle') { // 表示正在同步中
              return [
                <status status={ row.sync_status } statusModule='cloudaccountSyncStatus' />,
              ]
            } else {
              const time = this.$moment(row.last_sync)
              if (time) {
                return time.fromNow()
              } else {
                return '-'
              }
            }
          },
        },
        formatter: ({ row }) => {
          if (row.sync_status !== 'idle') { // 表示正在同步中
            return ''
          } else {
            const time = this.$moment(row.last_sync)
            if (time) {
              return time.fromNow()
            } else {
              return '-'
            }
          }
        },
      },
      {
        field: 'probe_at',
        title: i18n.t('cloudenv.text_309'),
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            const time = this.$moment(row.probe_at)
            if (time) {
              return time.fromNow()
            } else {
              return '-'
            }
          },
        },
      },
      getPublicScopeTableColumn({ vm: this, resource: 'cloudaccounts' }),
      getProjectDomainTableColumn(),
      getResourceMatchProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
