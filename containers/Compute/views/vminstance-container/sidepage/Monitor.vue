<template>
  <div>
    <base-monitor
      :data="data"
      :constants="monitorConstants"
      monitorType="basic"
      :currentMonitorType="currentMonitorType" />
  </div>
</template>

<script>
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'
import WindowsMixin from '@/mixins/windows'
import { POD_MONITOR } from '../constants'

export default {
  name: 'VmContainerMonitorSidepage',
  components: {
    BaseMonitor,
  },
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      currentMonitorType: 'basic',
      monitorConstants: POD_MONITOR,
    }
  },
  methods: {},
}
</script>
