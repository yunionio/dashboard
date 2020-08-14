import * as R from 'ramda'
import i18n from '@/locales'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import store from '@/store'

export const getAccessUrlTableColumn = () => {
  return {
    field: 'access_url',
    title: '环境',
    minWidth: 100,
    showOverflow: 'ellipsis',
    slots: {
      default: ({ row }, h) => {
        if (!row.access_url) return '-'
        let txt
        Object.keys(i18n.t('cloudAccountAccessType')).forEach(k => {
          if (row.access_url.indexOf(k) > -1) {
            txt = i18n.t('cloudAccountAccessType')[k]
          }
        })
        return txt ||
        [
          <a class="link-color" target="_blank" href={ row.access_url }>{ row.access_url }</a>,
        ]
      },
    },
  }
}

export const getBalanceTableColumn = () => {
  return {
    field: 'balance',
    title: '余额',
    minWidth: 70,
    showOverflow: 'ellipsis',
    formatter: ({ row }) => {
      if (R.isNil(row.balance)) {
        return '-'
      }
      return row.balance
    },
  }
}

export const getGuestCountTableColumn = () => {
  return {
    field: 'guest_count',
    title: '虚拟机',
    width: 60,
  }
}

export const getHostCountTableColumn = () => {
  return {
    field: 'host_count',
    title: '宿主机',
    minWidth: 70,
  }
}

export const getPublicScopeTableColumn = ({
  vm,
} = {}) => {
  return {
    field: 'public_scope',
    title: '共享范围',
    width: 110,
    showOverflow: 'title',
    hidden: () => {
      return !store.getters.l3PermissionEnable && (store.getters.scopeResource && store.getters.scopeResource.domain.includes('cloudaccounts'))
    },
    slots: {
      default: ({ row }, h) => {
        if (!row.is_public) return i18n.t('cloudAccountShareDesc.none')
        const { share_mode: shareMode, public_scope: publicScope, shared_domains: sharedDomains } = row
        if (publicScope === 'domain') {
          if (shareMode === 'provider_domain' && sharedDomains && sharedDomains.length > 0) {
            return [
              <a onClick={() => {
                vm.createDialog('CommonDialog', {
                  hiddenCancel: true,
                  header: '共享范围',
                  body: () => {
                    return (
                      <dialog-table
                        vxeGridProps={{ showOverflow: 'title' }}
                        data={ sharedDomains }
                        columns={
                          [
                            getCopyWithContentTableColumn({
                              field: 'id',
                              title: 'ID',
                              minWidth: 140,
                            }),
                            getCopyWithContentTableColumn({
                              field: 'name',
                              title: '名称',
                            }),
                          ]
                        } />
                    )
                  },
                })
              }}>{ i18n.t('cloudAccountShareDesc.provider') }</a>,
            ]
          }
          if (shareMode === 'system' && sharedDomains && sharedDomains.length > 0) {
            return [
              <a onClick={() => {
                vm.createDialog('CommonDialog', {
                  hiddenCancel: true,
                  header: '共享范围',
                  body: () => {
                    return (
                      <dialog-table
                        vxeGridProps={{ showOverflow: 'title' }}
                        data={ sharedDomains }
                        columns={
                          [
                            getCopyWithContentTableColumn({
                              field: 'id',
                              title: 'ID',
                              minWidth: 140,
                            }),
                            getCopyWithContentTableColumn({
                              field: 'name',
                              title: '名称',
                            }),
                          ]
                        } />
                    )
                  },
                })
              }}>{ i18n.t('cloudAccountShareDesc.account') }</a>,
            ]
          }
        }
        if (publicScope === 'system') {
          if (shareMode === 'provider_domain') {
            return i18n.t('cloudAccountShareDesc.providerAll')
          }
          if (shareMode === 'system') {
            return i18n.t('cloudAccountShareDesc.accountAll')
          }
        }
        return '-'
      },
    },
  }
}
