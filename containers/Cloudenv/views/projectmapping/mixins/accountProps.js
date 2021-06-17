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
                if (row.auto_create_project) {
                  return [
                    <span class='mr-2'>{ this.$t('cloudenv.text_493') }</span>,
                    <help-tooltip name='cloudaccountAutoCreateProject' />,
                  ]
                }
                return [
                  <list-body-cell-wrap copy field='tenant' row={row} />,
                ]
              },
            },
          },
        ],
      }
    },
  },
}
