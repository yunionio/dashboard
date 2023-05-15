import {
  getStatusTableColumn,
  getBrandTableColumn,
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        vm: this,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, resource: 'networkinterface', columns: () => this.columns }),
      getCopyWithContentTableColumn({ field: 'mac', title: i18n.t('network.text_228') }),
      getStatusTableColumn({ statusModule: 'network' }),
      getPublicScopeTableColumn({ vm: this, resource: 'networkinterfaces' }),
      getProjectDomainTableColumn(),
      getBrandTableColumn(),
      getCopyWithContentTableColumn({
        field: 'account',
        title: i18n.t('network.text_196'),
        minWidth: 110,
      }),
      getCopyWithContentTableColumn({
        field: 'cloudregion',
        title: i18n.t('network.text_199'),
        minWidth: 120,
      }),
      getCopyWithContentTableColumn({
        field: 'associate_type',
        title: i18n.t('network.text_230'),
        minWidth: 160,
      }),
      getCopyWithContentTableColumn({ field: 'associate_id', title: i18n.t('network.text_234') }),
    ]
  },
}
