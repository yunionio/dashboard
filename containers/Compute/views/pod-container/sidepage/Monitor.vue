<template>
  <div>
    <base-monitor
      :data="data"
      :constants="monitorConstants"
      monitorType="basic"
      :resId="data.guest_id"
      :currentMonitorType="currentMonitorType"
      :extraTags="extraTags" />
  </div>
</template>

<script>
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'
import WindowsMixin from '@/mixins/windows'
import { CONTAINER_MONITOR } from '../constants'

export default {
  name: 'MonitorListForVmPodContainerSidepage',
  components: {
    BaseMonitor,
  },
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    serverColumns: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      currentMonitorType: 'basic',
      monitorConstants: CONTAINER_MONITOR,
      extraTags: [{
        key: 'container_name',
        operator: '=',
        value: this.data.name
      }, {
        key: 'pod_id',
        operator: '=',
        value: this.data.guest_id
      }],
    }
  },
  methods: {},
}
</script>
