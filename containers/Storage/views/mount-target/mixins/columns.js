import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'

import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        field: 'network_type',
        hideField: true,
        edit: false,
        title: i18n.t('common.network.type'),
        slotCallback: row => {
          let name = i18n.t('common.network.type.vpc')
          if (row.network_type === 'classic') {
            name = i18n.t('common.network.type.classic')
          }
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ name }</side-page-trigger>
          )
        },
      }),
      getCopyWithContentTableColumn({ field: 'vpc', title: i18n.t('dictionary.vpc') }),
      getCopyWithContentTableColumn({ field: 'network', title: i18n.t('dictionary.network') }),
      getCopyWithContentTableColumn({ field: 'domain_name', title: i18n.t('storage.mount.target.domain.name') }),
      getCopyWithContentTableColumn({ field: 'access_group', title: i18n.t('dictionary.access_group') }),
      getStatusTableColumn({ statusModule: 'mountTarget' }),
    ]
  },
}
