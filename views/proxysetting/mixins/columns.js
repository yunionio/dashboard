import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getProjectDomainTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'

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
            <side-page-trigger name="ProxysettingSidePage" id={row.id} list={this.list} vm={this}>{ row.name } {row.id === 'DIRECT' && '（直连）'}</side-page-trigger>
          )
        },
      }),
      getCopyWithContentTableColumn({
        field: 'https_proxy',
        title: 'https代理',
      }),
      getCopyWithContentTableColumn({
        field: 'http_proxy',
        title: 'http代理',
      }),
      getCopyWithContentTableColumn({
        field: 'no_proxy',
        title: '不走代理地址',
      }),
      getPublicScopeTableColumn({ vm: this, resource: 'proxysettings' }),
      getProjectDomainTableColumn(),
    ]
  },
}
