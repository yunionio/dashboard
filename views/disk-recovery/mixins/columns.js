import * as R from 'ramda'
import { getBrandTableColumn, getStatusTableColumn, getCopyWithContentTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

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
        getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
        getCopyWithContentTableColumn({ field: 'storage', title: '存储' }),
        getCopyWithContentTableColumn({ field: 'guest', title: this.$t('dictionary.server') }),
        {
          field: 'disk_type',
          title: '类型',
          width: 70,
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? '系统盘' : '数据盘'
          },
        },
        getStatusTableColumn({ statusModule: 'disk' }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        getTimeTableColumn({ field: 'auto_delete_at', title: '自动清除时间' }),
      ]
      return column
    },
  },
}
