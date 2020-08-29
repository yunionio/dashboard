import {
  getZoneTypeTableColumns,
  getVpcCountTableColumns,
  getDnsRecordsetCountTableColumns,

} from '../utils/columns'
import {
  getNameDescriptionTableColumn,
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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'dns_zones', columns: () => this.columns }),
      getZoneTypeTableColumns(),
      getDnsRecordsetCountTableColumns(),
      getVpcCountTableColumns(),
      getPublicScopeTableColumn(),
      getProjectDomainTableColumn(),
    ]
  },
}
