import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getIpsTableColumn,
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
        field: 'guest_count',
        title: i18n.t('table.title.associated_server'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && row.guest_count === undefined) return [<data-loading />]
            return [<side-page-trigger vm={this} name='InstanceGroupSidePage' id={row.id} list={this.list} tab='v-m-instance-list-for-instance-group'>{ row.guest_count }</side-page-trigger>]
          },
        },
      },
      getIpsTableColumn({ field: 'vips', title: i18n.t('compute.vip_address'), vm: this }),
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
