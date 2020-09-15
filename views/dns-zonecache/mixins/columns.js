import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: this.$t('network.text_156'),
        edit: false,
        formRules: function (row) {
          return [
            { required: true, message: this.$t('network.text_173') },
          ]
        },
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getBrandTableColumn(),
      getStatusTableColumn({ statusModule: 'dnszonecache' }),
      getAccountTableColumn(),
      getTimeTableColumn(),
      getTimeTableColumn({ title: this.$t('network.text_314'), field: 'updated_at' }),
    ]
  },
}
