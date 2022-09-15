import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getAccountTableColumn,
  getBillingTypeTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import {
  getTrainingJobTableColumn,
  getInferenceServiceTableColumn,
  getDevelopEnvTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'modelarts' }),
      getTrainingJobTableColumn(),
      getInferenceServiceTableColumn(),
      getDevelopEnvTableColumn(),
      getAccountTableColumn(),
      getBillingTypeTableColumn(),
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
