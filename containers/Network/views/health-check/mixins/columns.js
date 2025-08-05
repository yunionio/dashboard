import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  healthCheckTypeColumn,
  healthCheckUriColumn,
  healthCheckPortColumn,
  healthCheckDomainColumn,
  healthCheckMethodColumn,
  healthCheckHttpCodeColumn,
  healthCheckIntervalColumn,
  healthCheckTimeoutColumn,
  healthCheckHealthyThresholdColumn,
  healthCheckUnhealthyThresholdColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({
        statusModule: 'healthCheck',
        vm: this,
      }),
      healthCheckTypeColumn(),
      healthCheckUriColumn(),
      healthCheckPortColumn(),
      healthCheckDomainColumn(),
      healthCheckMethodColumn(),
      healthCheckHttpCodeColumn(),
      healthCheckIntervalColumn(),
      healthCheckTimeoutColumn(),
      healthCheckHealthyThresholdColumn(),
      healthCheckUnhealthyThresholdColumn(),
      getBrandTableColumn(),
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
