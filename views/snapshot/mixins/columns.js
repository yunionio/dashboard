import { DISK_TYPES } from '../constants'
import { getStorageTypeTableColumn } from '../utils/columns'
import { sizestr } from '@/utils/utils'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getCopyWithContentTableColumn,
  getTagTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'

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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'snapshot', columns: () => this.columns }),
      getCopyWithContentTableColumn({
        field: 'disk_name',
        title: '硬盘',
      }),
      {
        field: 'disk_type',
        title: '磁盘类型',
        width: 70,
        formatter: ({ row }) => {
          return DISK_TYPES[row.disk_type] || row.disk_type
        },
      },
      {
        field: 'size',
        title: '快照大小',
        width: 70,
        formatter: ({ row }) => {
          return sizestr(row.size, 'M', 1024)
        },
      },
      getStatusTableColumn({ statusModule: 'snapshot' }),
      getProjectTableColumn(),
      getBrandTableColumn(),
      {
        field: 'guest',
        title: '虚拟机',
        minWidth: 70,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            return [
              <div class='text-truncate'>
                {row.guest ? <list-body-cell-wrap copy field='guest' row={row} /> : '-'}
                {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : ''}
              </div>,
            ]
          },
        },
      },
      getTimeTableColumn(),
      getStorageTypeTableColumn(),
      getRegionTableColumn(),
      getAccountTableColumn(),
    ]
  },
}
