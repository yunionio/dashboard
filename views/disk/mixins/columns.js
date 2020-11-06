import { MEDIUM_MAP } from '../../../constants'
import { getUnusedTableColumn } from '../utils/columns'
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
      getStatusTableColumn({ statusModule: 'disk' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'disk', columns: () => this.columns }),
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
      {
        field: 'disk_type',
        title: i18n.t('table.title.disk_type'),
        width: 70,
        formatter: ({ cellValue }) => {
          return cellValue === 'sys' ? i18n.t('compute.text_49') : i18n.t('compute.text_50')
        },
      },
      getUnusedTableColumn(),
      {
        field: 'guest',
        title: this.$t('res.server'),
        minWidth: 100,
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
      {
        field: 'medium_type',
        title: i18n.t('table.title.disk_medium_type'),
        width: 70,
        formatter: ({ cellValue }) => {
          return MEDIUM_MAP[cellValue]
        },
      },
      getBillingTypeTableColumn(),
      getBrandTableColumn(),
      getAccountTableColumn(),
      getCopyWithContentTableColumn({ field: 'storage', title: i18n.t('table.title.disk_storage') }),
      getTimeTableColumn(),
      getProjectTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
