import i18n from '@/locales'
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import InstantModelImportStatus from '../components/InstantModelImportStatus.vue'
import {
  // getPackageNameTableColumn,
  // getAppIdTableColumn,
  // getPackageVersionTableColumn,
  // getAppImageTableColumn,
  getAppSizeTableColumn,
  getAppCacheStatusColumn,
  getModelIdTableColumn,
  getModelNameTableColumn,
  getModelTagTableColumn,
  getLlmTypeTableColumn,
  // getIconTableColumn,
} from '../utils/columns'

export default {
  components: {
    InstantModelImportStatus,
  },
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
      {
        field: 'status',
        title: i18n.t('common.status'),
        sortable: true,
        minWidth: 160,
        slots: {
          default: ({ row }) => {
            return [
              <instant-model-import-status status={row.status} progress={row.progress} />,
            ]
          },
        },
        formatter: ({ row }) => {
          return i18n.te(`status.image.${row.status}`) ? i18n.t(`status.image.${row.status}`) : row.status
        },
      },
      getEnabledTableColumn(),
      getEnabledTableColumn({
        field: 'auto_cache',
        title: this.$t('aice.mounted_apps.auto_cache'),
      }),
      getAppCacheStatusColumn(),
      getModelIdTableColumn(),
      getModelNameTableColumn(),
      getModelTagTableColumn(),
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
