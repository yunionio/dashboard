import { getAssociateNameTableColumn } from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getProjectTableColumn,
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
      getStatusTableColumn({ statusModule: 'eip' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'server', columns: () => this.columns }),
      {
        field: 'ip_addr',
        title: 'IP',
        width: 140,
      },
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
      {
        field: 'account',
        title: i18n.t('network.text_196'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            const ret = []
            ret.push(
              <list-body-cell-wrap hide-field copy field='account' row={row}>
                <span style={{ color: '#0A1F44' }}>{ row.account }</span>
              </list-body-cell-wrap>,
            )
            if (row.manager) {
              ret.push(
                <list-body-cell-wrap hide-field copy field='manager' row={row}>
                  <span style={{ color: '#53627C' }}>{ row.manager }</span>
                </list-body-cell-wrap>,
              )
            }
            return ret
          },
        },
        hidden: this.$store.getters.isProjectMode,
      },
      getAssociateNameTableColumn(),
      getProjectTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
