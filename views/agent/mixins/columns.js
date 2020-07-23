import {
  getNameDescriptionTableColumn,
  getTagTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        vm: this,
        hideField: true,
        title: '名称',
        onManager: this.onManager,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'loadbalanceragent', columns: () => this.columns }),
      {
        field: 'cluster',
        title: '集群',
        showOverflow: 'ellipsis',
        minWidth: 100,
      },
      {
        field: 'ha_state',
        title: '主备',
        width: 70,
      },
      {
        field: 'ip',
        title: 'IP',
        width: 120,
      },
      {
        field: 'hb_last_seen',
        title: '上一次心跳',
        width: 100,
        formatter: ({ cellValue }) => {
          return this.$moment(cellValue).fromNow()
        },
      },
      getRegionTableColumn(),
      {
        field: 'version',
        title: '软件版本',
        width: 250,
      },
    ]
  },
}
