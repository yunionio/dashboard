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
        title: this.$t('dictionary.server'),
        width: 70,
      },
      {
        field: 'vpc_count',
        title: 'VPC',
        minWidth: 120,
        showOverflow: 'title',
      },
      {
        field: 'zone_count',
        title: '可用区',
        width: 70,
      },
    ]
  },
}
