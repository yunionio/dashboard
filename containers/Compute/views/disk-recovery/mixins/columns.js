import * as R from 'ramda'
import { getNameDescriptionTableColumn, getBrandTableColumn, getStatusTableColumn, getCopyWithContentTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  props: {
    getColumns: {
      type: [Function, Array],
    },
  },
  data () {
    return {
      columns: this.getColumn(),
    }
  },
  methods: {
    getColumn () {
      let column = []
      if (R.is(Function, this.getColumns)) {
        column = this.getColumns()
        return column
      }
      if (R.is(Array, this.getColumns) && this.getColumns.length > 0) {
        column = this.getColumns
        return column
      }
      column = [
        getNameDescriptionTableColumn({
          field: 'name',
          edit: false,
          editDesc: false,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({ statusModule: 'disk', hiddenLogView: true }),
        {
          field: 'disk_type',
          title: i18n.t('compute.text_175'),
          width: 70,
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? i18n.t('compute.text_49') : i18n.t('compute.text_50')
          },
        },
        getCopyWithContentTableColumn({
          field: 'storage',
          title: i18n.t('compute.text_99'),
          hideField: true,
          slotCallback: (row) => {
            if (!row.storage) return [<data-loading />]
            return row.storage
          },
        }),
        getCopyWithContentTableColumn({
          field: 'guest',
          title: this.$t('dictionary.server'),
          hideField: true,
          slotCallback: (row) => {
            if (this.isPreLoad && !row.guest) return [<data-loading />]
            return row.guest
          },
        }),
        getBrandTableColumn(),
        getTimeTableColumn({ field: 'auto_delete_at', title: i18n.t('compute.text_480'), vm: this }),
        getProjectTableColumn(),
      ]
      return column
    },
  },
}
