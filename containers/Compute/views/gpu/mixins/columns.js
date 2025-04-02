import i18n from '@/locales'
import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getReserveResourceColumn,
} from '../utils/columns'

export default {
  created () {
    const DEVICE_MAP = {
      '10de': 'nvidia',
      1002: 'amd',
    }
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row, 'gpu-detail') }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'dev_type',
        title: i18n.t('compute.text_481'),
        width: 120,
        showOverflow: 'ellipsis',
      },
      {
        field: 'model',
        title: i18n.t('compute.text_482'),
        minWidth: 120,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            const device = row.vendor_device_id.split(':')[0]
            if (!device) {
              return row.model
            }
            return [
              <div class='d-flex'>
                <span class='text-truncate'>{ row.model }</span>
                <icon class="ml-1" style="line-height: 24px" type={ DEVICE_MAP[device] } />
              </div>,
            ]
          },
        },
      },
      {
        field: 'vendor_device_id',
        title: 'PCI ID',
        width: 120,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            if (row.vendor_device_id) {
              if (row.vendor_device_id === '0000:0000') {
                return row.vendor_device_id
              } else {
                const url = 'https://admin.pci-ids.ucw.cz/read/PC/' + row.vendor_device_id.replace(':', '/')
                return [
                  <list-body-cell-wrap copy hideField={true} field='vendor_device_id' row={row} message={row.vendor_device_id}>
                    <div class='d-flex'>
                      <span class='text-truncate'>{ row.vendor_device_id }</span>
                      <a href={ url } target="pciid"><a-icon type="link" /></a>
                    </div>
                  </list-body-cell-wrap>,
                ]
              }
            }
          },
        },
      },
      {
        field: 'device_path',
        title: i18n.t('compute.isolated_devices.device_path.title'),
        width: 120,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            const ret = []
            if (row.device_path) {
              ret.push(
                [
                  <list-body-cell-wrap copy hideField={true} field='device_path' row={row} message={row.device_path}>
                    {row.device_path}
                  </list-body-cell-wrap>,
                ],
              )
            }
            return ret
          },
        },
      },
      {
        field: 'numa_node',
        title: 'NUMA',
        width: 80,
        formatter: function ({ row }) {
          if (row.numa_node >= 0) {
            return row.numa_node
          }
          return '-'
        },
      },
      {
        field: 'guest',
        title: this.$t('compute.text_483', [this.$t('dictionary.server')]),
        minWidth: 100,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }, h) => {
            if (this.isPreLoad && !row.guest) return [<data-loading />]
            return [
              <div class='text-truncate'>
                <list-body-cell-wrap copy={true} row={row} field="guest" onManager={this.onManager} hideField={ true }>
                  <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row, 'servers-list') }>{ row.guest }</side-page-trigger>
                </list-body-cell-wrap>
                {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : ''}
              </div>,
            ]
          },
        },
      },
      getCopyWithContentTableColumn({
        field: 'host',
        title: i18n.t('compute.text_484'),
        hideField: true,
        slotCallback: row => {
          if (this.isPreLoad && !(row.host && row.host_id)) return [<data-loading />]
          return row.host || row.host_id
        },
      }),
      getReserveResourceColumn(),
      getPublicScopeTableColumn({ resource: 'isolated_devices', vm: this, title: this.$t('compute.text_113') }),
      getRegionTableColumn({ vm: this }),
    ]
  },
}
