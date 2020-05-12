import {
  getStatusTableColumn,
  getEnabledTableColumn,
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'account',
        title: '订阅（Subscription）ID',
        showOverflow: 'ellipsis',
        minWidth: 160,
        slots: {
          default: ({ row }) => {
            let subscribeIds = (row.account && row.account.split('/')) || []
            const text = subscribeIds.length > 1 ? subscribeIds[1] : subscribeIds[0]
            return [
              <list-body-cell-wrap message={text} copy hideField={true}>
                <span>{text}</span>
              </list-body-cell-wrap>,
            ]
          },
        },
      },
      getEnabledTableColumn(),
      getStatusTableColumn({ statusModule: 'cloudaccount' }),
      {
        field: 'last_auto_sync',
        title: '同步时间',
        width: 80,
        slots: {
          default: ({ row }) => {
            if (row.sync_status !== 'idle') { // 表示正在同步中
              return [
                <status status={ row.sync_status } statusModule='cloudaccountSyncStatus' />,
              ]
            } else {
              let time = this.$moment(row.last_sync)
              if (time) {
                return time.fromNow()
              } else {
                return '-'
              }
            }
          },
        },
      },
      getStatusTableColumn({
        field: 'sync_status',
        title: '同步状态',
        minWidth: 100,
        statusModule: 'cloudaccountSyncStatus',
      }),
      getCopyWithContentTableColumn({
        field: 'project_domain',
        title: `所属${this.$t('dictionary.domain')}`,
      }),
      getCopyWithContentTableColumn({
        field: 'tenant',
        title: `资源默认归属${this.$t('dictionary.project')}`,
        minWidth: 140,
      }),
    ]
  },
}
