import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: '域名',
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getCopyWithContentTableColumn({
        field: 'records',
        title: '记录值',
      }),
      {
        field: 'ttl',
        title: 'TTL',
        formatter: ({ cellValue, row }) => {
          const ttlTime = parseInt(cellValue / 60)
          if (ttlTime >= 1440) { // 一天是 1440 分钟
            return `${parseInt(ttlTime / 1440)} 天`
          } else if (ttlTime >= 60) {
            return `${parseInt(ttlTime / 60)} 小时`
          } else if (ttlTime > 1) {
            return `${ttlTime} 分钟`
          } else {
            return `${cellValue || 0} 秒`
          }
        },
      },
      getEnabledTableColumn(),
    ]
  },
}
