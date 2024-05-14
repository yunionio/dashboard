import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import {
  getImageTableColumn,
  getEnvTableColumn,
  getCommandTableColumn,
  getArgsTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        editDesc: false,
        formRules: [
          { required: true, message: this.$t('compute.text_210') },
        ],
        statusModule: 'container',
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'container' }),
      getImageTableColumn(),
      getEnvTableColumn(),
      getCommandTableColumn(),
      getArgsTableColumn(),
    ]
  },
}
