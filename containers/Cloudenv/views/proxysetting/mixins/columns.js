import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getProjectDomainTableColumn,
  getPublicScopeTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: (row) => {
          if (row.id === 'DIRECT') return false
          const { isDomainMode, userInfo } = this.$store.getters
          if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
            return false
          }
          return true
        },
        showDesc: (row) => {
          if (row.id === 'DIRECT') return false
          const { isDomainMode, userInfo } = this.$store.getters
          if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
            return false
          }
          return true
        },
        slotCallback: row => {
          return (
            <side-page-trigger name="ProxysettingSidePage" id={row.id} list={this.list} vm={this}>{ row.name } {row.id === 'DIRECT' && i18n.t('cloudenv.text_110')}</side-page-trigger>
          )
        },
      }),
      getCopyWithContentTableColumn({
        field: 'https_proxy',
        title: i18n.t('cloudenv.text_395'),
      }),
      getCopyWithContentTableColumn({
        field: 'http_proxy',
        title: i18n.t('cloudenv.text_398'),
      }),
      getCopyWithContentTableColumn({
        field: 'no_proxy',
        title: i18n.t('cloudenv.text_401'),
      }),
      getPublicScopeTableColumn({ vm: this, resource: 'proxysettings' }),
      getProjectDomainTableColumn({ sortable: false }),
      getTimeTableColumn(),
    ]
  },
}
