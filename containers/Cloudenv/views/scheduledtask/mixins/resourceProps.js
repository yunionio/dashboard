import {
  getNameDescriptionTableColumn,
  getIpsTableColumn,
  getProjectTableColumn,
  getStatusTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getEnabledTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getIpFilter,
  getBrandFilter,
} from '@/utils/common/tableFilter'

export default {
  computed: {
    resourceProps () {
      const currentItem = this.params?.data?.[0] || {}
      const { tenant, resource_type = 'server' } = currentItem
      const resourceProps = {
        server: {
          list: this.$list.createList(this, {
            resource: 'servers',
            getParams: {
              filter: 'hypervisor.notin(baremetal,container)',
              tenant,
            },
            filterOptions: {
              name: getNameFilter(),
              ips: getIpFilter(),
              brand: getBrandFilter('compute_engine_brands'),
            },
          }),
          columns: [
            getNameDescriptionTableColumn({
              hideField: true,
              addLock: true,
              addBackup: true,
              edit: false,
              editDesc: false,
              minWidth: 120,
              slotCallback: row => {
                return [
                  <list-body-cell-wrap field='name' row={row} />,
                ]
              },
            }),
            getIpsTableColumn({ field: 'ip', title: 'IP' }),
            getBrandTableColumn({ field: 'provider' }),
            getStatusTableColumn({ statusModule: 'server' }),
            getProjectTableColumn(),
            getRegionTableColumn(),
          ],
        },
        cloudaccount: {
          list: this.$list.createList(this, {
            resource: 'cloudaccounts',
            getParams: {
              tenant,
            },
            filterOptions: {
              name: getNameFilter(),
              brand: getBrandFilter('compute_engine_brands'),
            },
          }),
          columns: [
            getNameDescriptionTableColumn({
              hideField: true,
              addLock: true,
              addBackup: true,
              edit: false,
              editDesc: false,
              minWidth: 120,
              slotCallback: row => {
                return [
                  <list-body-cell-wrap field='name' row={row} />,
                ]
              },
            }),
            getStatusTableColumn({ statusModule: 'cloudaccount' }),
            getEnabledTableColumn(),
            getBrandTableColumn(),
            {
              field: 'last_auto_sync',
              title: this.$t('cloudenv.text_103'),
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
            getProjectDomainTableColumn(),
          ],
        },
      }
      return resourceProps[resource_type]
    },
  },
}
