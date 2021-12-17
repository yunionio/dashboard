<template>
  <base-monitor :data="data" :constants="monitorConstants" :resId="serverId" idKey="id" />
</template>

<script>
import { NODE_MONITOR_MAP } from '@K8S/constants'
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'

export default {
  name: 'K8sNodeMonitor',
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
      return NODE_MONITOR_MAP.aliyun
    },
    serverId () {
      return this.data.id
    },
  },
}
</script>
