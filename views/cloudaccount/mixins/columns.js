import * as R from 'ramda'
import {
  getBrandTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getPublicTableColumn,
  getCopyWithContentTableColumn,
  getNameDescriptionTableColumn,
  getProjectTableColumn,
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
        field: 'access_url',
        title: '服务器地址',
        minWidth: 100,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            if (!row.access_url) return '-'
            return [
              <a class="link-color" href={ row.access_url }>{ row.access_url }</a>,
            ]
          },
        },
      },
      getEnabledTableColumn(),
      getStatusTableColumn({ statusModule: 'cloudaccount' }),
      getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: '健康状态', field: 'health_status', minWidth: 90 }),
      {
        field: 'guest_count',
        title: '虚拟机',
        width: 60,
      },
      {
        field: 'balance',
        title: '余额',
        minWidth: 70,
        showOverflow: 'ellipsis',
        formatter: ({ row }) => {
          if (R.isNil(row.balance)) {
            return '-'
          }
          return row.balance
        },
      },
      {
        field: 'host_count',
        title: '宿主机',
        minWidth: 70,
      },
      getCopyWithContentTableColumn({ field: 'account', title: '账号' }),
      getBrandTableColumn(),
      getEnabledTableColumn({ field: 'enable_auto_sync', title: '自动同步', minWidth: 90 }),
      {
        field: 'last_auto_sync',
        title: '同步时间',
        width: 70,
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
      getPublicTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
