import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'

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
      getPublicScopeTableColumn({ vm: this }),
      getProjectDomainTableColumn(),
    ]
  },
}
