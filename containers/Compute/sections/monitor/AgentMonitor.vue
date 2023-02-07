<template>
  <base-monitor
    :data="data"
    :constants="constants"
    :resId="resId"
    :idKey="idKey"
    :monitorType="monitorType"
    :currentMonitorType="currentMonitorType" />
</template>

<script>
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'
import { AGENT_MONITOR } from '@Compute/views/vminstance/constants'

export default {
  name: 'AgentMonitor',
  components: {
    BaseMonitor,
  },
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
    constants: {
      type: Array,
      default: () => AGENT_MONITOR,
    },
    resId: {
      type: String,
    },
    idKey: {
      type: String,
    },
    monitorType: String,
    currentMonitorType: String,
  },
}
</script>
