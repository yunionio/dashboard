import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger vm={this} name='InstanceGroupSidePage' id={row.id} list={this.list} tab='instance-group-detail'>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'instanceGroup' }),
      getEnabledTableColumn(),
      {
        field: 'force_dispersion',
        title: i18n.t('table.title.strategy'),
        minWidth: 70,
        formatter: ({ cellValue }) => {
          let ret = i18n.t('compute.text_696')
          if (cellValue) ret = i18n.t('compute.text_695')
          return ret
        },
      },
      {
        field: 'granularity',
        title: i18n.t('table.title.granularity'),
        minWidth: 70,
      },
      {
        field: 'guest_count',
        title: i18n.t('table.title.associated_server'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            return [<side-page-trigger vm={this} name='InstanceGroupSidePage' id={row.id} list={this.list} tab='v-m-instance-list-for-instance-group'>{ row.guest_count }</side-page-trigger>]
          },
        },
      },
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
