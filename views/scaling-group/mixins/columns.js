import { getCopyWithContentTableColumn, getStatusTableColumn, getBrandTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn, getEnabledTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger name='ScalingGroupSidePage' id={row.id} list={this.list} vm={this}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn(),
      getStatusTableColumn({ statusModule: 'scalinggroup', minWidth: 130 }),
      getCopyWithContentTableColumn({
        field: 'guest_template',
        title: i18n.t('res.servertemplate'),
        hideField: true,
        showOverflow: 'ellipsis',
        width: 120,
        slotCallback: row => {
          if (!row.guest_template) return '-'
          return row.guest_template
        },
      }),
      {
        field: 'instance_number',
        title: i18n.t('compute.text_874'),
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'desire_instance_number',
        title: i18n.t('compute.text_875'),
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'min_instance_number',
        title: i18n.t('compute.text_876'),
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'max_instance_number',
        title: i18n.t('compute.text_877'),
        minWidth: 100,
        sortable: true,
      },
      getProjectTableColumn(),
      getBrandTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
