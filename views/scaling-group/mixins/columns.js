import { getCopyWithContentTableColumn, getStatusTableColumn, getBrandTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn, getEnabledTableColumn } from '@/utils/common/tableColumn'

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
        title: '主机模版',
        hideField: true,
        showOverflow: 'ellipsis',
        width: 120,
        slotCallback: row => {
          if (!row.guest_template) return '-'
          return row.guest_template
          // return [<side-page-trigger name='ScalingGroupSidePage' id={row.id} tab="server-template-list" list={this.list} vm={this}>{ row.name }</side-page-trigger>]
        },
      }),
      {
        field: 'instance_number',
        title: '当前实例数',
        width: 100,
        sortable: true,
        slots: {
          default: ({ row }) => {
            if (!row.instance_number) return '-'
            return row.instance_number
            // return [<side-page-trigger name='ScalingGroupSidePage' id={row.id} tab="server-list" list={this.list} vm={this}>{ row.instance_number }</side-page-trigger>]
          },
        },
      },
      {
        field: 'desire_instance_number',
        title: '期望实例数',
        width: 100,
        sortable: true,
      },
      {
        field: 'min_instance_number',
        title: '最小实例数',
        width: 100,
        sortable: true,
      },
      {
        field: 'max_instance_number',
        title: '最大实例数',
        width: 100,
        sortable: true,
      },
      getProjectTableColumn(),
      getBrandTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
