import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getRegionTableColumn, getStatusTableColumn, getBrandTableColumn, getEnabledTableColumn, getNameDescriptionTableColumn, getPublicScopeTableColumn, getProjectDomainTableColumn } from '@/utils/common/tableColumn'
import { sizestr, percentstr } from '@/utils/utils'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addBackup: true,
        formRules: [
          { required: true, message: '请输入名称' },
          { validator: this.$validate('serverCreateName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
        cellWrapSlots: row => {
          return {
            append: () => row.is_baremetal ? (<a-tooltip title="有IPMI信息，可转换为物理机"><icon class='ml-2' type='res-host' style={{ 'color': '#1890ff' }} /></a-tooltip>) : null,
          }
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
                  <list-body-cell-wrap row={row} field="access_ip" copy><span class="text-color-help">(管理)</span></list-body-cell-wrap>
                </div>
              )
            }
            if (row.ipmi_ip) {
              cellWrap.push(
                <div class="d-flex">
                  <list-body-cell-wrap row={row} field="ipmi_ip" copy><span class="text-color-help">(带外)</span></list-body-cell-wrap>
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
        formatter ({ cellValue }) {
          return cellValue || '0'
        },
      },
      {
        field: 'cpu_count',
        title: '物理CPU',
        minWidth: 80,
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
        title: '物理内存',
        minWidth: 80,
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
        title: '物理存储',
        minWidth: 80,
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
      getPublicScopeTableColumn(),
      getProjectDomainTableColumn(),
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
