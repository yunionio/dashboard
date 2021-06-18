import { getColumns, getResource } from '../utils'
import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import { getTagColor, getTagTitle } from '@/utils/common/tag'

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
        type: 'expand',
        slots: {
          default: ({ row }) => {
            return row.rules ? row.rules.length : '-'
          },
          content: ({ row }) => {
            const columns = [
              {
                field: 'tags',
                title: i18n.t('cloudenv.text_582'),
                slots: {
                  default: ({ row }) => {
                    if (!row.tags) return '-'
                    return [<div>{row.condition === 'or' ? i18n.t('cloudenv.text_587') : i18n.t('cloudenv.text_588')}</div>, <div>{
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
                  return row.project ? row.project : '-'
                },
              },
            ]
            return <vxe-grid size="mini" border columns={columns} data={row.rules ? row.rules : []} />
          },
        },
      },
      {
        title: this.$t('cloudenv.text_503'),
        field: 'account',
        slots: {
          default: ({ row }) => {
            const data = row.accounts || row.managers
            if (!data) return '-'
            const header = row.accounts?.length > 0 ? this.$t('cloudenv.text_589') : this.$t('cloudenv.project_mapping_use_cloudprovider')
            const resIds = data.map(v => v.id)
            const columns = getColumns(row)
            const resource = getResource(row)
            return [
              <a onClick={() => {
                this.createDialog('CommonDialog', {
                  hiddenCancel: true,
                  header,
                  body: () => {
                    return (
                      <dialog-table
                        vxeGridProps={{ showOverflow: 'title' }}
                        resource={ resource }
                        params={{ filter: `id.in(${resIds.join(',')})` }}
                        columns={ columns } />
                    )
                  },
                })
              }}>{ data.length }</a>,
            ]
          },
        },
      },
      getProjectDomainTableColumn({ sortable: false }),
    ]
  },
}
