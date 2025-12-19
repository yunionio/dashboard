import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  // getPackageNameTableColumn,
  // getAppIdTableColumn,
  // getPackageVersionTableColumn,
  // getAppImageTableColumn,
  getAppSizeTableColumn,
  getAppCacheStatusColumn,
  getModelIdTableColumn,
  getModelNameTableColumn,
  getLlmTypeTableColumn,
  // getIconTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      // getIconTableColumn(),
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'image' }),
      getEnabledTableColumn(),
      getEnabledTableColumn({
        field: 'auto_cache',
        title: this.$t('aice.mounted_apps.auto_cache'),
      }),
      getAppCacheStatusColumn(),
      getModelIdTableColumn(),
      getModelNameTableColumn(),
      getLlmTypeTableColumn(),
      // getPackageNameTableColumn(),
      // getAppIdTableColumn(),
      // getPackageVersionTableColumn(),
      // getAppImageTableColumn({ vm: this }),
      getAppSizeTableColumn(),
      getProjectTableColumn(),
      getPublicScopeTableColumn({
        vm: this,
        resource: 'llm_instant_models',
      }),
      // getTimeTableColumn({
      //   field: 'last_updated',
      //   title: this.$t('aice.instantapp.last_updated'),
      // }),
      getTimeTableColumn(),
    ]
  },
}
