import { getAccountTableColumn } from '../utils/columns'
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
    return {}
  },
  computed: {
    cloudprovidersProps () {
      return {
        list: this.$list.createList(this, {
          resource: 'cloudproviders',
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
          getAccountTableColumn(),
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
      }
    },
  },
}
