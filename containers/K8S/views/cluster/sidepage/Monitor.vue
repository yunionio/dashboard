<template>
  <base-monitor :data="data" :constants="monitorConstants" :resId="serverId" idKey="cluster_id" />
</template>

<script>
import { NODE_MONITOR_MAP } from '@K8S/constants'
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'

export default {
  name: 'K8sClusterMonitor',
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
      return NODE_MONITOR_MAP.aliyun.map(item => {
        return {
          ...item,
          groupBy: ['node'],
        }
      })
    },
    serverId () {
      return this.data.id
    },
  },
}
</script>
