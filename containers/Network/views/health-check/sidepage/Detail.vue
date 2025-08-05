<template>
  <detail
    :on-manager="onManager"
    :data="data"
    statusModule="healthCheck"
    resource="loadbalancer_health_checks"
    :base-info="baseInfo"
    auto-hidden-columns-key="health_check_hidden_columns" />
</template>

<script>
import { getBrandTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
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
  name: 'HealthCheckDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    columns: Array,
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
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
      ],
    }
  },
}
</script>
