import { getBandwidthTableColumn } from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getRegionTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'wire', columns: () => this.columns }),
      getBandwidthTableColumn(),
      getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC', sortable: true }),
      {
        field: 'networks',
        title: i18n.t('network.text_695'),
        width: 100,
        sortable: true,
      },
      getBrandTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'wires' }),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
