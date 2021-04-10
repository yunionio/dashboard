<template>
  <node-alert-list :get-params="params" :data="data" :alertType="params.type" />
</template>

<script>
import { KVM_MONITOR_OPTS, VMWARE_MONITOR_OPTS } from '../constants.js'
import NodeAlertList from '@Compute/views/node-alert/components/List'
// import { metricItems } from '@Compute/views/node-alert/constants'

export default {
  name: 'HostNodeAlertListSidepage',
  components: {
    NodeAlertList,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      params: {
        details: true,
        type: 'host',
        node_id: this.data.id,
      },
    }
  },
  computed: {
    isKvm () { // KVM型 宿主机
      return this.$itemData.data.host_type === 'hypervisor'
    },
    metricOpts () {
      const opts = this.isKvm ? KVM_MONITOR_OPTS : VMWARE_MONITOR_OPTS
      return opts.map(val => {
        const metric = {
          value: val.seleteItem,
          label: `${val.label}(${val.seleteItem})`,
        }
        return metric
      })
    },
  },
}
</script>
