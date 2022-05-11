import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: i18n.t('network.text_21'),
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'intranet_ip_addr',
        title: i18n.t('network.ssh-proxy.intranet_ip_addr'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            return [<div>
              <list-body-cell-wrap hide-field copy field='intranet_ip_addr' row={row}>
                <span style={{ color: '#53627C' }}>{ row.intranet_ip_addr || '-' }</span>
              </list-body-cell-wrap>
            </div>]
          },
        },
      },
      {
        field: 'host',
        title: i18n.t('network.ssh-proxy.host'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            return [<div>
              <list-body-cell-wrap hide-field copy field='host' row={row}>
                <span style={{ color: '#53627C' }}>{ row.host || '-' }</span>
              </list-body-cell-wrap>
            </div>]
          },
        },
      },
      { field: 'port', title: i18n.t('network.ssh-proxy.port') },
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
