import {
  getNameDescriptionTableColumn,
  getTagTableColumn,
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
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'credentials',
        columns: () => this.columns,
        tipName: this.$t('aice.container_secret'),
      }),
      getTimeTableColumn({
        field: 'created_at',
        title: this.$t('table.title.create_time'),
      }),
    ]
  },
}
