import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getTagTableColumn,
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
      getStatusTableColumn({ statusModule: 'vpc' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'vpc', columns: () => this.columns }),
      getCopyWithContentTableColumn({
        field: 'cidr_block',
        title: i18n.t('network.text_244'),
        sortable: true,
      }),
      {
        field: 'wire_count',
        title: i18n.t('network.text_571'),
        width: 100,
        sortable: true,
      },
      {
        field: 'network_count',
        title: i18n.t('network.text_682'),
        width: 100,
        sortable: true,
        slots: {
          default: ({ row }) => {
            if (row.network_count <= 0) return row.network_count
            return [
              <side-page-trigger name='VpcSidePage' id={row.id} tab='network-list' vm={this}>{row.network_count}</side-page-trigger>,
            ]
          },
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'vpcs' }),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
