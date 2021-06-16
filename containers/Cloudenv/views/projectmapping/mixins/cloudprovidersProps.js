import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getBrandFilter,
} from '@/utils/common/tableFilter'

export default {
  data () {
    return {
      cloudprovidersProps: {
        list: this.$list.createList(this, {
          resource: 'cloudproviders',
          getParams: {},
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
          {
            field: 'account',
            title: this.$t('cloudenv.text_353'),
            showOverflow: 'ellipsis',
            minWidth: 160,
            slots: {
              default: ({ row }) => {
                const subscribeIds = (row.account && row.account.split('/')) || []
                const text = subscribeIds.length > 1 ? subscribeIds[1] : subscribeIds[0]
                return [
                  <list-body-cell-wrap message={text} copy hideField={true}>
                    <span>{text}</span>
                  </list-body-cell-wrap>,
                ]
              },
            },
          },
          getBrandTableColumn(),
          getCopyWithContentTableColumn({
            field: 'cloudaccount',
            title: this.$t('cloudenv.text_12'),
          }),
          getCopyWithContentTableColumn({
            field: 'project_domain',
            title: this.$t('cloudenv.text_355', [this.$t('dictionary.domain')]),
          }),
          getCopyWithContentTableColumn({
            field: 'tenant',
            title: this.$t('cloudenv.text_356', [this.$t('dictionary.project')]),
            minWidth: 140,
          }),
        ],
      },
    }
  },
}
