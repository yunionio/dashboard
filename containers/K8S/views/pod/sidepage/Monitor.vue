<template>
  <base-monitor :data="data" :constants="monitorConstants" :resId="serverId" idKey="id" />
</template>

<script>
import { POD_MONITOR_MAP } from '@K8S/constants'
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'

export default {
  name: 'K8sPodMonitor',
  components: { BaseMonitor },
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
  },
  data () {
    return {
    }
  },
  computed: {
    hypervisor () {
      return this.data.hypervisor
    },
    monitorConstants () {
      return POD_MONITOR_MAP.aliyun
    },
    serverId () {
      return this.data.id
    },
  },
}
</script>
