import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        // addLock: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'globalVpc' }),
      getBrandTableColumn(),
      {
        field: 'vpc_count',
        title: i18n.t('network.text_243'),
        width: 100,
      },
      getPublicScopeTableColumn({ vm: this, resource: 'globalvpcs' }),
      getProjectDomainTableColumn(),
    ]
  },
}
