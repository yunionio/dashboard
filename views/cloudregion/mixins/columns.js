import {
  getEnabledTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn({ title: '状态' }),
      {
        field: 'guest_count',
        title: '云服务器',
        width: 70,
      },
      {
        field: 'vpc_count',
        title: '专有网络(VPC)',
        width: 100,
      },
      {
        field: 'zone_count',
        title: '可用区',
        width: 70,
      },
    ]
  },
}
