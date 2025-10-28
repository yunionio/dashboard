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
      getStatusTableColumn({ statusModule: 'instanceGroup', vm: this }),
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
        title: i18n.t('compute.associated_instances'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && row.guest_count === undefined) return [<data-loading />]
            return [<side-page-trigger vm={this} name='InstanceGroupSidePage' id={row.id} list={this.list} tab='associated-instances'>{ row.guest_count }</side-page-trigger>]
          },
        },
      },
      getIpsTableColumn({ field: 'vips', title: i18n.t('compute.vip_address'), vm: this }),
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
