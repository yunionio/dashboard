<template>
  <base-monitor
    :data="data"
    :constants="constants" />
</template>

<script>
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'
import { AGENT_TEMPERATURE_MONITOR } from '@Compute/views/vminstance/constants'

export default {
  name: 'AgentTemperatureMonitor',
  components: {
    BaseMonitor,
  },
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      constants: AGENT_TEMPERATURE_MONITOR,
    }
  },
}
</script>
