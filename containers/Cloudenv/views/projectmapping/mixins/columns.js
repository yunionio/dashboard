import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import { getTagColor, getTagTitle } from '@/utils/common/tag'
import { getTargetColumns } from '../utils'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: (row) => {
          const { isDomainMode, userInfo } = this.$store.getters
          if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
            return false
          }
          return true
        },
        showDesc: (row) => {
          const { isDomainMode, userInfo } = this.$store.getters
          if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
            return false
          }
          return true
        },
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({
        statusModule: 'projectMapping',
        minWidth: 100,
      }),
      getEnabledTableColumn(),
      {
        field: 'rules',
        title: i18n.t('cloudenv.text_582'),
        slots: {
          default: ({ row }) => {
            const columns = [
              {
                field: 'tags',
                title: i18n.t('cloudenv.text_582'),
                slots: {
                  default: ({ row }) => {
                    if (!row.tags) return '-'
                    return [<div>{this.getRuleCondition(row)}</div>, <div>{
                      row.tags.map(item => {
                        const rgb = getTagColor(item.key, item.value, 'rgb')
                        const strRgb = rgb.join(',')
                        const text = getTagTitle('user:' + item.key, item.value)
                        return (<span
                          class="tag mb-1 text-truncate d-inline-block"
                          title={getTagTitle(item.key, item.value)}
                          key={`${item.key}${item.value}`}
                          style={{ backgroundColor: `rgba(${strRgb},.1)`, boxSizing: 'border-box', color: `rgb(${strRgb})`, border: `solid 1px rgb(${strRgb})`, padding: '0 5px', marginRight: '10px' }}>
                          { text }
                        </span>)
                      })
                    }</div>]
                  },
                },
              },
              {
                field: 'project_name',
                title: i18n.t('cloudenv.text_584'),
                formatter: ({ row }) => {
                  if (row.condition === 'and' && !row.hasOwnProperty('project_id') && !row.hasOwnProperty('project')) {
                    return i18n.t('cloudenv.project_same_as_tag_value')
                  }
                  let project = row.project
                  if (project) {
                    if (row.project_id) {
                      project += ` (${this.$t('cloudenv.target_project')})`
                    } else {
                      project += ` (${this.$t('cloudenv.target_name')})`
                    }
                  }
                  return project || '-'
                },
              },
            ]
            return [<list-body-cell-popover text={this.$t('common_701', [row.rules ? row.rules.length : 0])} min-width="600px">
              <vxe-grid size="mini" border showOverflow={false} row-config={{ isHover: true }} column-config={{ resizable: false }} columns={columns} data={row.rules ? row.rules : []} />
            </list-body-cell-popover>]
          },
        },
      },
      {
        title: this.$t('cloudenv.text_503'),
        field: 'account',
        slots: {
          default: ({ row }) => {
            const ret = []
            if (row.accounts && row.accounts.length) {
              const resIds = row.accounts.map(v => v.id)
              ret.push(<div><a onClick={() => {
                this.createDialog('CommonDialog', {
                  hiddenCancel: true,
                  header: this.$t('cloudenv.text_589'),
                  body: () => {
                    return (
                      <dialog-table
                        vxeGridProps={{ showOverflow: 'title' }}
                        resource='cloudaccounts'
                        params={{ scope: this.$store.getters.scope, filter: `id.in(${resIds.join(',')})` }}
                        columns={getTargetColumns('accounts')} />
                    )
                  },
                })
              }}>{row.accounts.length}</a><span class="text-color-secondary">{' (' + this.$t('cloudenv.project_mapping_account') + ')'}</span></div>)
            }
            if (row.managers && row.managers.length) {
              const resIds = row.managers.map(v => v.id)
              ret.push(<div><a onClick={() => {
                this.createDialog('CommonDialog', {
                  hiddenCancel: true,
                  header: this.$t('cloudenv.project_mapping_use_cloudprovider'),
                  body: () => {
                    return (
                      <dialog-table
                        vxeGridProps={{ showOverflow: 'title' }}
                        resource='cloudproviders'
                        params={{ scope: this.$store.getters.scope, filter: `id.in(${resIds.join(',')})` }}
                        columns={getTargetColumns('providers')} />
                    )
                  },
                })
              }}>{row.managers.length}</a><span class="text-color-secondary">{' (' + this.$t('cloudenv.project_mapping_cloudprovider') + ')'}</span></div>)
            }
            if (!ret.length) return '-'
            return ret
          },
        },
      },
      getPublicScopeTableColumn({ vm: this }),
      getProjectDomainTableColumn({ sortable: false }),
      getTimeTableColumn(),
    ]
  },
  methods: {
    getRuleCondition (data) {
      const { condition } = data
      if (condition === 'or') {
        return i18n.t('cloudenv.text_587')
      } else if (data.hasOwnProperty('project_id') || data.hasOwnProperty('project')) {
        return i18n.t('cloudenv.text_588')
      } else {
        return i18n.t('cloudenv.match_by_tag_key')
      }
    },
  },
}
