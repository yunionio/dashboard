import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getRegionTableColumn, getStatusTableColumn, getBrandTableColumn, getEnabledTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { sizestr, percentstr } from '@/utils/utils'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn(),
      getStatusTableColumn({ statusModule: 'host' }),
      {
        field: 'custom_ip',
        title: 'IP',
        width: 160,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            let cellWrap = []
            if (row.access_ip) {
              cellWrap.push(
                <div class="d-flex">
                 管理IP：<list-body-cell-wrap row={row} field="access_ip" copy />
                </div>
              )
            }
            if (row.ipmi_ip) {
              cellWrap.push(
                <div class="d-flex">
                  带外IP：<list-body-cell-wrap row={row} field="ipmi_ip" copy />
                </div>
              )
            }
            return cellWrap
          },
        },
      },
      getStatusTableColumn({ field: 'host_status', title: '服务', statusModule: 'host_status' }),
      {
        field: 'nonsystem_guests',
        title: '#VM',
        width: 60,
        slots: {
          default: ({ row }, h) => {
            const ret = [
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row, 'vminstance-list') }>{ row.nonsystem_guests || '0' }</side-page-trigger>,
            ]
            return ret
          },
        },
      },
      {
        field: 'cpu_count',
        title: 'CPU',
        minWidth: 60,
        showOverflow: 'title',
        formatter: ({ cellValue, row }) => {
          if (cellValue) {
            return '' + cellValue + '/' + percentstr(row.cpu_commit_rate)
          } else {
            return 'N/A'
          }
        },
      },
      {
        field: 'mem_size',
        title: '内存',
        minWidth: 60,
        showOverflow: 'title',
        formatter: ({ cellValue, row }) => {
          if (cellValue) {
            return sizestr(cellValue, 'M', 1024) + '/' + percentstr(row.mem_commit_rate)
          } else {
            return 'N/A'
          }
        },
      },
      {
        field: 'storage_size',
        title: '存储',
        minWidth: 60,
        showOverflow: 'title',
        formatter: ({ cellValue, row }) => {
          if (cellValue) {
            return sizestr(cellValue, 'M', 1024) + '/' + percentstr(row.storage_commit_rate)
          } else {
            return 'N/A'
          }
        },
      },
      {
        field: 'sn',
        title: 'SN',
        width: 100,
        showOverflow: 'title',
      },
      getBrandTableColumn(),
      getRegionTableColumn(),
      {
        field: 'id',
        title: 'IPMI',
        width: 60,
        slots: {
          default: ({ cellValue, row }) => {
            if (!row.is_baremetal) {
              return '-'
            } else {
              return [<PasswordFetcher serverId={ row.id } resourceType='baremetals' />]
            }
          },
        },
      },
      {
        field: 'server_id',
        title: '初始账号',
        width: 70,
        slots: {
          default: ({ cellValue, row }) => {
            if (!row.is_baremetal) {
              return '-'
            } else {
              return [<PasswordFetcher serverId={ row.server_id } resourceType='servers' />]
            }
          },
        },
      },
    ]
  },
}
