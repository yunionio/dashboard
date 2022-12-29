import {
  getBrandTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getCopyWithContentTableColumn,
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import {
  getAccessUrlTableColumn,
  getBalanceTableColumn,
  getGuestCountTableColumn,
  getHostCountTableColumn,
  getPublicScopeTableColumn,
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
      getStatusTableColumn({ statusModule: 'cloudaccount' }),
      getEnabledTableColumn(),
      getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: i18n.t('cloudenv.text_93'), field: 'health_status', minWidth: 90 }),
      getBalanceTableColumn(),
      getBrandTableColumn(),
      getCopyWithContentTableColumn({ field: 'account', title: i18n.t('cloudenv.text_94') }),
      getHostCountTableColumn(),
      getGuestCountTableColumn(),
      // getEnabledTableColumn({ field: 'enable_auto_sync', title: i18n.t('cloudenv.text_83'), minWidth: 90 }),
      {
        field: 'last_auto_sync',
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
      {
        field: 'tenant',
        title: i18n.t('scope.text_573', [i18n.t('dictionary.project')]),
        minWidth: 120,
        showOverflow: 'title',
        slots: {
          default: ({ row }) => {
            const ret = []
            if (row.auto_create_project) {
              ret.push(<span class='mr-2'>{this.$t('cloudenv.text_493')}</span>)
              ret.push(<help-tooltip name='cloudaccountAutoCreateProject' />)
            } else {
              ret.push(<list-body-cell-wrap copy field='tenant' row={row} />)
            }
            if (row.project_mapping) {
              let label = ''
              if (row.enable_resource_sync) {
                label = i18n.t('cloudenv.resource_project_mapping')
              } else if (row.enable_project_sync) {
                label = i18n.t('cloudenv.project_project_mapping')
              }
              ret.push(<list-body-cell-wrap copy field='project_mapping' row={row} hideField><span class="text-color-secondary">{label || this.$t('cloudenv.text_580')}：{row.project_mapping}</span></list-body-cell-wrap>)
            }
            return ret
          },
        },
      },
      getTimeTableColumn(),
    ]
  },
}
