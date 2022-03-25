import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getBillingTypeTableColumn,
  getTagTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import {
  getUnusedTableColumn,
  getStorageTypeTableColumn,
} from '../utils/columns'
import { MEDIUM_MAP } from '../../../constants'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('compute.text_210') },
          { validator: this.$validate('resourceCreateName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      // getStatusTableColumn({ statusModule: 'disk' }),
      getTagTableColumn({
        onManager: this.onManager,
        needExt: true,
        resource: 'disks',
        columns: () => this.columns,
        editCheck: (row) => (row.provider || '').toLowerCase() !== 'bingocloud',
      }),
      {
        field: 'disk_size',
        title: i18n.t('table.title.disk_size'),
        minWidth: 50,
        formatter: ({ cellValue }) => {
          return sizestr(cellValue, 'M', 1024)
        },
      },
      {
        field: 'disk_format',
        title: i18n.t('table.title.disk_format'),
        width: 70,
      },
      getStorageTypeTableColumn(),
      {
        field: 'disk_type',
        title: i18n.t('table.title.disk_type'),
        width: 70,
        formatter: ({ cellValue }) => {
          return cellValue === 'sys' ? i18n.t('compute.text_49') : i18n.t('compute.text_50')
        },
      },
      getUnusedTableColumn({ vm: this }),
      {
        field: 'guest',
        title: this.$t('res.server'),
        minWidth: 100,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            if (this.isPreLoad && !row.guest) return [<data-loading />]
            if (!row.guest || row.guests.length <= 0) return '-'
            const guests = row.guests.map((guest, index) => {
              return <side-page-trigger permission="server_get" name="VmInstanceSidePage" id={guest.id} vm={this} tab="vm-instance-detail">
                {guest.name}
                <status status={ guest.status } statusModule='server'/>
              </side-page-trigger>
            })
            return [
              <div>
                { guests }
              </div>,
            ]
          },
        },
      },
      getCopyWithContentTableColumn({
        field: 'storage',
        title: i18n.t('table.title.disk_storage'),
        hideField: true,
        slotCallback: (row) => {
          if (this.isPreLoad && !row.storage) return [<data-loading />]
          return row.storage
        },
      }),
      getTimeTableColumn(),
      getBrandTableColumn(),
      getRegionTableColumn({ vm: this }),
      getBillingTypeTableColumn(),
      getStatusTableColumn({ statusModule: 'disk' }),
      getProjectTableColumn(),
      getAccountTableColumn({ vm: this }),
      {
        field: 'medium_type',
        title: i18n.t('table.title.disk_medium_type'),
        width: 70,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.medium_type) return [<data-loading />]
            return MEDIUM_MAP[row.medium_type]
          },
        },
        hidden: this.hiddenColumns.includes('medium_type'),
      },
    ]
  },
}
