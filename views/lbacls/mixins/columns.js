import {
  getNameDescriptionTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: i18n.t('network.text_291'),
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'acl_entries',
        title: i18n.t('network.text_312'),
        width: 150,
        type: 'expand',
        slots: {
          content: ({ row }, h) => {
            const arr = []
            if (row.acl_entries && row.acl_entries.length > 0) {
              row.acl_entries.forEach(obj => {
                let text = obj.cidr
                if (obj.comment) {
                  text += ` | ${obj.comment}`
                }
                arr.push({
                  value: text,
                })
              })
            }
            const ret = []
            if (arr.length > 0) {
              ret.push(
                <div class='mb-2'>
                  { arr.map(item => <a-tag>{ item.value }</a-tag>) }
                </div>,
              )
            }
            if (ret.length <= 0) {
              ret.push(
                <div>{this.$t('newwork.acl_entries')}</div>,
              )
            }
            return ret
          },
        },
      },
      {
        field: 'lb_listener_count',
        title: '关联的监听（数量）',
      },
      getTimeTableColumn(),
      {
        field: 'updated_at',
        title: i18n.t('network.text_314'),
        width: 150,
        formatter: ({ cellValue }) => {
          return this.$moment(cellValue).format()
        },
      },
      getProjectTableColumn(),
    ]
  },
}
