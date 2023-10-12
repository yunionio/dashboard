import * as R from 'ramda'
import { BLOCKED_RESOURCES_MAP } from '@Cloudenv/constants'
import i18n from '@/locales'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import store from '@/store'

export const getAccessUrlTableColumn = () => {
  return {
    field: 'access_url',
    title: i18n.t('cloudenv.text_96'),
    minWidth: 100,
    showOverflow: 'ellipsis',
    slots: {
      default: ({ row }, h) => {
        if (!row.access_url || row.brand === 'Huawei') return '-'
        let txt
        Object.keys(i18n.t('cloudAccountAccessType')).forEach(k => {
          if (row.access_url.indexOf(k) > -1) {
            let _k = k
            if (row.brand !== 'Aliyun' && k === 'InternationalCloud') {
              _k = 'Internation'
            }
            txt = i18n.t('cloudAccountAccessType')[_k]
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
    title: i18n.t('cloudenv.text_100'),
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

export const getLastSyncCostTableColumn = () => {
  return {
    field: 'last_sync_cost',
    title: i18n.t('cloudenv.last_sync_cost'),
    minWidth: 70,
    showOverflow: 'ellipsis',
    formatter: ({ row }) => {
      if (R.isNil(row.last_sync_cost)) {
        return '-'
      }
      return row.last_sync_cost
    },
  }
}

export const getGuestCountTableColumn = () => {
  return {
    field: 'guest_count',
    title: i18n.t('cloudenv.text_99'),
    width: 60,
  }
}

export const getHostCountTableColumn = () => {
  return {
    field: 'host_count',
    title: i18n.t('cloudenv.text_101'),
    minWidth: 70,
  }
}

export const getPublicScopeTableColumn = ({
  vm,
} = {}) => {
  return {
    field: 'public_scope',
    title: i18n.t('cloudenv.text_282'),
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
                  header: i18n.t('cloudenv.text_282'),
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
                              title: i18n.t('cloudenv.text_95'),
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
                  header: i18n.t('cloudenv.text_282'),
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
                              title: i18n.t('cloudenv.text_95'),
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

export const getResourceMatchProjectTableColumn = () => {
  return {
    field: 'resource_tenant',
    title: i18n.t('cloudenv.resource_map_type'),
    minWidth: 120,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        const ret = []
        const resourceMapType = []
        const { auto_create_project, auto_create_project_for_provider, project_mapping, tenant } = row
        if (project_mapping) resourceMapType.push('project_mapping')
        if (auto_create_project) resourceMapType.push('external_project')
        if (auto_create_project_for_provider) resourceMapType.push('cloudprovider')
        if (resourceMapType.length) {
          ret.push(<span class='mr-2'>{i18n.t('cloudenv.text_493')}</span>)
          let tooltip = ''
          if (resourceMapType.length === 1) {
            tooltip = i18n.t(`cloudenv.resource_map_type.${resourceMapType[0]}`)
          } else if (resourceMapType.length === 2) {
            tooltip = i18n.t(`cloudenv.resource_map_type.${resourceMapType[0]}_and_${resourceMapType[1]}`)
          } else {
            tooltip = i18n.t('cloudenv.resource_map_type.all')
          }
          if (tenant) {
            tooltip += (i18n.t('cloudenv.default_project') + ': ' + tenant)
          }
          ret.push(<help-tooltip text={tooltip} />)
          if (project_mapping) {
            let label = ''
            if (row.enable_resource_sync) {
              label = i18n.t('cloudenv.resource_project_mapping')
            } else if (row.enable_project_sync) {
              label = i18n.t('cloudenv.project_project_mapping')
            }
            ret.push(<list-body-cell-wrap copy field='project_mapping' row={row} hideField><span class="text-color-secondary">{label || i18n.t('cloudenv.text_580')}：{project_mapping}</span></list-body-cell-wrap>)
          }
        } else {
          ret.push(<list-body-cell-wrap copy field='tenant' row={row} hideField><span>{i18n.t('cloudenv.target_project')}：{tenant}</span></list-body-cell-wrap>)
        }
        return ret
      },
    },
  }
}

export const getBlockResourceTableColumn = () => {
  return {
    field: 'skip_sync_resources',
    title: i18n.t('cloudenv.block_resources_type'),
    minWidth: 120,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        if (!row.skip_sync_resources) return '-'
        const skip_sync_resources = row.skip_sync_resources || []
        return skip_sync_resources.map(item => {
          return <a-tag>{ BLOCKED_RESOURCES_MAP[item].label }</a-tag>
        })
      },
    },
    formatter: ({ row }) => {
      const skip_sync_resources = row.skip_sync_resources || []
      return skip_sync_resources.map(item => {
        return BLOCKED_RESOURCES_MAP[item].label
      })
    },
  }
}
