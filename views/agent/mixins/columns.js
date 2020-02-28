import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        vm: this,
        hideField: true,
        title: '名称',
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'cluster',
        title: '集群',
        width: 70,
      },
      {
        field: 'ha_state',
        title: '主备',
        width: 70,
      },
      {
        field: 'ip',
        title: 'IP',
        width: 100,
      },
      {
        field: 'hb_last_seen',
        title: '上一次心跳',
        width: 100,
        formatter: ({ cellValue }) => {
          return this.$moment(cellValue).fromNow()
        },
      },
      {
        field: 'zone',
        title: '可用区',
        width: 70,
      },
      {
        field: 'version',
        title: '软件版本',
        width: 250,
      },
    ]
  },
}
