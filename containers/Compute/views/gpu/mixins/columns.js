import {
  getReserveResourceColumn,
} from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

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
      getRegionTableColumn({ vm: this }),
    ]
  },
}
