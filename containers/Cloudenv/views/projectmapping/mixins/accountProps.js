import { getAccessUrlTableColumn } from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getBrandFilter,
} from '@/utils/common/tableFilter'

export default {
  data () {
    return {}
  },
  computed: {
    accountsProps () {
      return {
        list: this.$list.createList(this, {
          resource: 'cloudaccounts',
          getParams: this.params,
          filterOptions: {
            name: getNameFilter(),
            brand: getBrandFilter(),
          },
        }),
        columns: [
          getNameDescriptionTableColumn({
            onManager: this.onManager,
            hideField: true,
            slotCallback: row => {
              return (
                <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
              )
            },
          }),
          getAccessUrlTableColumn(),
          getBrandTableColumn(),
          getProjectDomainTableColumn(),
          {
            field: 'tenant',
            title: this.$t('scope.text_573', [this.$t('dictionary.project')]),
            minWidth: 120,
            showOverflow: 'title',
            slots: {
              default: ({ row }) => {
                const ret = []
                if (row.auto_create_project) {
                  ret.push(<span class='mr-2'>{this.$t('cloudenv.text_493')}</span>)
                  ret.push(<help-tooltip name='cloudaccountAutoCreateProject' />)
                } else {
                  ret.push(<list-body-cell-wrap copy field='tenant' row={row} />)
                }
                if (row.project_mapping) {
                  ret.push(<list-body-cell-wrap copy field='project_mapping' row={row} hideField>{this.$t('cloudenv.text_580')}：{row.project_mapping}</list-body-cell-wrap>)
                }
                return ret
              },
            },
          },
        ],
      }
    },
  },
}
