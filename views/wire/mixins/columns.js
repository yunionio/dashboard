import { getBandwidthTableColumn } from '../utils/columns'
import HostColumn from '@Network/views/wire/sections/hosts'
import {
  getNameDescriptionTableColumn,
  getRegionTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
  getTagTableColumn, getStatusTableColumn,
} from '@/utils/common/tableColumn'
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
      getStatusTableColumn({ statusModule: 'wire' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'wire', columns: () => this.columns }),
      getBandwidthTableColumn(),
      getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC', sortable: true }),
      {
        field: 'networks',
        title: i18n.t('network.text_695'),
        width: 100,
        type: 'expand',
        sortable: true,
        slots: {
          default: ({ row }) => {
            return i18n.t('compute.text_619', [row.networks])
          },
          content: ({ row }, h) => {
            const columns = [
              {
                field: 'name',
                title: i18n.t('network.text_21'),
                width: '25%',
                slots: {
                  default: ({ row }) => {
                    return row.name
                  },
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
                  default: ({ row }) => {
                    return [
                      <div>{ row.guest_ip_start }</div>,
                    ]
                  },
                },
              },
              {
                field: 'guest_ip_end',
                title: i18n.t('network.text_608'),
                width: '25%',
                slots: {
                  default: ({ row }) => {
                    return [
                      <div>{ row.guest_ip_end }</div>,
                    ]
                  },
                },
              },
            ]
            const data = row.wireNetworks || []
            const networkTitle = i18n.t('network.wire.networks') + ': '
            return [<HostColumn hosts={ row.wireHosts || [] } />, <span style="font-size: larger;font-weight: bold;">{networkTitle}</span>, <vxe-grid size="mini" border columns={columns} data={data} />]
          },
        },
      },
      getBrandTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'wires' }),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
