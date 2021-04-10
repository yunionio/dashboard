<template>
  <node-alert-list
    :get-params="params"
    :data="data"
    :alertType="params.type"
    :metric-opts="metricOpts"
    :list-id="id" />
</template>

<script>
import NodeAlertList from '@Compute/views/node-alert/components/List'
import { metricItems } from '@Compute/views/node-alert/constants'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'VmInstanceNodeAlertListSidepage',
  components: {
    NodeAlertList,
  },
  props: {
    id: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      params: {
        details: true,
        type: 'guest',
        node_id: this.data.id,
      },
    }
  },
  computed: {
    hypervisor () {
      let hyper = ''
      if (this.data && this.data.hypervisor) {
        hyper = this.data.hypervisor
      }
      return hyper
    },
    hasMemMetric () {
      return this.hypervisor === HYPERVISORS_MAP.esxi.key
    },
    metricOpts () {
      const opts = [metricItems['vm_cpu.usage_active'], metricItems['vm_netio.bps_recv'], metricItems['vm_netio.bps_sent'], metricItems['vm_diskio.read_bps'], metricItems['vm_diskio.write_bps']]
      if (this.hasMemMetric) {
        opts.splice(1, 0, metricItems['vm_mem.used_percent'])
      }
      return opts
    },
  },
}
</script>
