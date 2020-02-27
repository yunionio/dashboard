import {
  getStatusTableColumn,
  getBrandTableColumn,
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        vm: this,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getCopyWithContentTableColumn({ field: 'mac', title: 'MAC地址' }),
      getStatusTableColumn({ statusModule: 'network' }),
      getBrandTableColumn(),
      getCopyWithContentTableColumn({
        field: 'associate_type',
        title: '绑定设备类型(VPC)',
      }),
      getCopyWithContentTableColumn({ field: 'associate_id', title: '绑定设备' }),
    ]
  },
}
