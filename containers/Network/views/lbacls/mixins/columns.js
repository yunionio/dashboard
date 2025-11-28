import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
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
        slots: {
          default: ({ row }, h) => {
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
            if (arr.length <= 0) {
              return [
                <div class='text-color-help'>{ this.$t('network.text_729') }</div>,
              ]
            }
            const list = arr.map(item => <a-tag class='mb-2 mr-1'>{ item.value }</a-tag>)
            return [<list-body-cell-popover text={i18n.t('common_323', [arr.length])} max-width="400px">
              <div style="display: inline-flex; flex-wrap: wrap; max-width: 40vw;">
                {...list}
              </div>
            </list-body-cell-popover>]
          },
        },
      },
      {
        field: 'lb_listener_count',
        title: this.$t('network.text_750'),
      },
      getStatusTableColumn({ statusModule: 'lbacl', vm: this }),
      getBrandTableColumn(),
      getAccountTableColumn(),
      getTimeTableColumn(),
      {
        field: 'updated_at',
        title: i18n.t('network.text_314'),
        width: 180,
        formatter: ({ cellValue }) => {
          return this.$moment(cellValue).format()
        },
      },
      getPublicScopeTableColumn({ vm: this, resource: 'loadbalanceracls' }),
      getRegionTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
