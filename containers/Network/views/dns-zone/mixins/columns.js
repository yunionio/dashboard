import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getPublicScopeTableColumn,
  getProjectTableColumn,
  getAccountTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import {
  getZoneTypeTableColumns,
  getVpcCountTableColumns,
  getDnsRecordsetCountTableColumns,

} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: i18n.t('network.text_156'),
        edit: false,
        formRules: function (row) {
          return [
            { required: true, message: i18n.t('network.text_173') },
          ]
        },
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, resource: 'dns_zones', columns: () => this.columns }),
      getBrandTableColumn(),
      getZoneTypeTableColumns(),
      getDnsRecordsetCountTableColumns(),
      getVpcCountTableColumns(),
      {
        field: 'status',
        title: i18n.t('common.status'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 80,
        slots: {
          default: ({ row }, h) => {
            return [
              <div class='text-truncate'>
                <div class="d-flex align-items-center">
                  <status status={row.status} statusModule={'dnszone'}>
                    {
                      row.status === 'pending' ? <a-popover slot="icon">
                        <template slot="content">
                          {row.registrar ? <div class="d-flex"><span style="flex: 0 0 150px">{this.$t('network.dnszone.registrar')}:</span><span>{row.registrar}<copy class="ml-1" message={row.registrar} /></span></div> : null}
                          {row.name_servers && row.name_servers.length > 0
                            ? <div class="d-flex">
                              <span style="flex: 0 0 150px">{this.$t('network.dnszone.add_name_servers')}:</span>
                              <span style="flex: 1">
                                {row.name_servers.map((server, index) => (
                                  <div key={index}>
                                    {server}<copy class="ml-1" message={server} />
                                  </div>
                                ))}
                              </span>
                            </div>
                            : null}
                          {row.original_name_servers && row.original_name_servers.length > 0
                            ? <div class="d-flex">
                              <span style="flex: 0 0 150px">{this.$t('network.dnszone.del_name_servers')}:</span>
                              <span style="flex: 1">
                                {row.original_name_servers.map((server, index) => (
                                  <div key={index}>
                                    {server}<copy class="ml-1" message={server} />
                                  </div>
                                ))}
                              </span>
                            </div>
                            : null}
                        </template>
                        <icon type="dashboard-alert-sum" class="ml-1" style={{ color: 'red' }} />
                      </a-popover> : null
                    }
                  </status>
                </div>
              </div>,
            ]
          },
        },
        formatter: ({ row }) => {
          return this.$te(`status.dnszone.${row.status}`) ? this.$t(`status.dnszone.${row.status}`) : row.status
        },
      },
      getPublicScopeTableColumn({ vm: this, resource: 'dns_zones' }),
      getAccountTableColumn(),
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
