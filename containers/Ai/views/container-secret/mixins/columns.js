import {
  getNameDescriptionTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name || '-'}</side-page-trigger>
          )
        },
      }),
      {
        field: 'type',
        title: this.$t('table.title.type'),
        width: 140,
      },
      getTimeTableColumn({
        field: 'created_at',
        title: this.$t('table.title.create_time'),
      }),
    ]
  },
}
