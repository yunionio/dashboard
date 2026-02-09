import HostColumn from '@Network/views/wire/sections/hosts'
import {
  getNameDescriptionTableColumn,
  getRegionTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
  getTagTableColumn, getStatusTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import { getBandwidthTableColumn, getMTUTableColumn } from '../utils/columns'

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
      getStatusTableColumn({ statusModule: 'wire', vm: this }),
      getTagTableColumn({ onManager: this.onManager, resource: 'wires', columns: () => this.columns }),
      getBandwidthTableColumn(),
      getMTUTableColumn(),
      getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC', sortable: true }),
      {
        field: 'networks',
        title: i18n.t('network.text_695'),
        width: 100,
        sortable: true,
        slots: {
          default: ({ row }) => {
            const handleVisibleChange = async (visible) => {
              if (!visible) return
              const hasLoaded = Array.isArray(row.wireNetworks) || Array.isArray(row.wireHosts)
              if (hasLoaded || row._loadingWireDetails || !row.id) return
              this.$set(row, '_loadingWireDetails', true)
              try {
                await this.loadDetails({ row })
              } finally {
                this.$set(row, '_loadingWireDetails', false)
              }
            }
            const columns = [
              {
                field: 'name',
                title: i18n.t('network.text_21'),
                width: '25%',
                slots: {
                  default: ({ row }) => row.name,
                },
              },
              {
                field: 'server_type',
                title: i18n.t('network.text_249'),
                width: '25%',
                formatter: ({ cellValue }) => {
                  return this.$t('networkServerType')[cellValue] || i18n.t('network.text_507')
                },
              },
              {
                field: 'guest_ip_start',
                title: i18n.t('network.text_607'),
                width: '25%',
                slots: {
                  default: ({ row }) => <div>{ row.guest_ip_start }</div>,
                },
              },
              {
                field: 'guest_ip_end',
                title: i18n.t('network.text_608'),
                width: '25%',
                slots: {
                  default: ({ row }) => <div>{ row.guest_ip_end }</div>,
                },
              },
            ]
            const networks = Array.isArray(row.wireNetworks) ? row.wireNetworks : null
            const hosts = Array.isArray(row.wireHosts) ? row.wireHosts : null
            const hasLoadedContent = (networks && networks.length > 0) || (hosts && hosts.length > 0)
            const contentStyle = hasLoadedContent ? { minWidth: '640px', maxWidth: '80vw' } : {}
            const keySuffix = `${networks ? networks.length : 'n'}-${hosts ? hosts.length : 'h'}`
            return [<a-popover trigger="hover" destroyTooltipOnHide onVisibleChange={handleVisibleChange} key={`wire-network-${row.id}-${keySuffix}`}>
              <div slot="content" style={contentStyle}>
                {networks || hosts ? (
                  <div>
                    <HostColumn hosts={ hosts || [] } />
                    <div style="font-size: larger;font-weight: bold;" class="mt-2 mb-2">{i18n.t('network.wire.networks')}:</div>
                    {networks && networks.length > 0 ? (
                      <vxe-grid size="mini" border showOverflow={false} columns={columns} data={ networks } />
                    ) : (
                      <div>{i18n.t('common.notData')}</div>
                    )}
                  </div>
                ) : (
                  <data-loading />
                )}
              </div>
              <span style="color: var(--antd-wave-shadow-color)" onMouseenter={() => handleVisibleChange(true)}>{i18n.t('compute.text_619', [row.networks])}</span>
            </a-popover>]
          },
        },
      },
      getBrandTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'wires' }),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
