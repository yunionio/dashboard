import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getCopyWithContentTableColumn({ field: 'public_key', title: '公钥内容' }),
      getCopyWithContentTableColumn({ field: 'fingerprint', title: '指纹' }),
      {
        field: 'scheme',
        title: '类型',
      },
      {
        field: 'linked_guest_count',
        title: '关联主机数',
      },
    ]
  },
}
