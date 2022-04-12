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
  getOsArch,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import { getStorageTypeTableColumn } from '../utils/columns'
import { DISK_TYPES } from '../constants'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addEncrypt: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'snapshot' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'snapshots', columns: () => this.columns }),
      getOsArch(),
      {
        field: 'size',
        title: i18n.t('table.title.snapshot_size'),
        width: 70,
        formatter: ({ row }) => {
          return sizestr(row.size, 'M', 1024)
        },
      },
      {
        field: 'disk_type',
        title: i18n.t('table.title.disk_type'),
        width: 70,
        formatter: ({ row }) => {
          return DISK_TYPES[row.disk_type] || row.disk_type
        },
      },
      getCopyWithContentTableColumn({
        field: 'disk_name',
        title: i18n.t('res.disk'),
        hideField: true,
        slotCallback: (row) => {
          if (this.isPreLoad && !row.disk_name) return [<data-loading />]
          return row.disk_name
        },
      }),
      getStorageTypeTableColumn({ vm: this }),
      {
        field: 'guest',
        title: i18n.t('res.server'),
        minWidth: 70,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            if (this.isPreLoad && !row.guest) return [<data-loading />]
            return [
              <div class='text-truncate'>
                {row.guest ? <list-body-cell-wrap copy field='guest' row={row} /> : '-'}
                {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : ''}
              </div>,
            ]
          },
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn({ vm: this }),
      getTimeTableColumn(),
      getProjectTableColumn(),
      getRegionTableColumn({ vm: this }),
    ]
  },
}
