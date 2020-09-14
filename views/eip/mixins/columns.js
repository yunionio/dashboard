import { getAssociateNameTableColumn } from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getProjectTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'

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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'server', columns: () => this.columns }),
      {
        field: 'ip_addr',
        title: i18n.t('network.text_191'),
        width: 140,
      },
      getStatusTableColumn({ statusModule: 'eip' }),
      getAssociateNameTableColumn(),
      {
        field: 'bandwidth',
        title: i18n.t('network.text_195'),
        minWidth: 80,
        showOverflow: 'ellipsis',
        formatter: ({ row, cellValue }) => {
          if (row.cloud_env === 'private') return '-'
          return sizestr(cellValue, 'M', 1024)
        },
      },
      {
        field: 'charge_type',
        title: i18n.t('network.text_192'),
        minWidth: 80,
        formatter: ({ cellValue }) => {
          if (cellValue === 'traffic') {
            return i18n.t('network.text_193')
          }
          if (cellValue === 'bandwidth') {
            return i18n.t('network.text_194')
          }
          return cellValue
        },
      },
      getBrandTableColumn(),
      getCopyWithContentTableColumn({
        field: 'account',
        title: i18n.t('network.text_196'),
        hidden: this.$store.getters.isProjectMode,
      }),
      getProjectTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
