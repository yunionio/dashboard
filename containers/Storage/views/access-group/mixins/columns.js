import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'

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
      getStatusTableColumn({ statusModule: 'accessGroup' }),
      getPublicScopeTableColumn({ vm: this, resource: 'access_groups' }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
