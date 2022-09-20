<template>
  <div>
    <base-monitor idKey="modelarts_pool_id" :data="data" :constants="cMonitorConstants" />
  </div>
</template>

<script>
import { metricItems } from '@Compute/views/node-alert/constants'
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'
import { ARCH_MAP, SPEC_MAP } from '../constants'

export default {
  name: 'ModelArtsMonitor',
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
      monitorConstants: [
        // CPU使用率
        {
          name: 'cpu',
          label: this.$t('compute.text_523'),
          seleteItem: 'usage_percent',
          fromItem: 'modelarts_pool_cpu',
          unit: '%',
          transfer: 1,
          metric: metricItems['modelarts_pool_cpu.usage_percent'].key, // 报警指标
          arch: [ARCH_MAP.CPU.key],
        },
        // 内存使用率
        {
          name: 'mem',
          label: this.$t('compute.text_518'),
          seleteItem: 'usage_percent',
          fromItem: 'modelarts_pool_mem',
          unit: '%',
          transfer: 1,
          metric: metricItems['modelarts_pool_cpu_mem.usage_percent'].key, // 报警指标
          arch: [ARCH_MAP.CPU.key],
        },
        // GPU使用率
        {
          name: 'gpu',
          label: this.$t('compute.modelarts.monitor.gpu.usage_percent'),
          seleteItem: 'usage_percent',
          fromItem: 'modelarts_pool_gpu',
          unit: '%',
          transfer: 1,
          metric: metricItems['modelarts_pool_gpu.usage_percent'].key, // 报警指标
          arch: [ARCH_MAP.GPU.key],
        },
        // GPU内存使用率
        {
          name: 'gpu_mem',
          label: this.$t('compute.modelarts.monitor.gpu_mem.usage_percent'),
          seleteItem: 'usage_percent',
          fromItem: 'modelarts_pool_gpu_mem',
          unit: '%',
          transfer: 1,
          metric: metricItems['modelarts_pool_gpu_mem.usage_percent'].key, // 报警指标
          arch: [ARCH_MAP.GPU.key],
        },
        // NPU使用率
        {
          name: 'cpu',
          label: this.$t('compute.modelarts.monitor.npu.usage_percent'),
          seleteItem: 'usage_percent',
          fromItem: 'modelarts_pool_npu',
          unit: '%',
          transfer: 1,
          metric: metricItems['modelarts_pool_npu.usage_percent'].key, // 报警指标
          arch: [ARCH_MAP.Ascend.key],
        },
        // NPU内存使用率
        {
          name: 'mem',
          label: this.$t('compute.modelarts.monitor.npu_mem.usage_percent'),
          seleteItem: 'usage_percent',
          fromItem: 'modelarts_pool_npu_mem',
          unit: '%',
          transfer: 1,
          metric: metricItems['modelarts_pool_npu_mem.usage_percent'].key, // 报警指标
          arch: [ARCH_MAP.Ascend.key],
        },
        // 磁盘可用容量
        {
          name: 'available_capacity',
          label: this.$t('compute.modelarts.monitor.disk.available_capacity'),
          seleteItem: 'available_capacity',
          fromItem: 'modelarts_pool_disk',
          unit: 'G',
          transfer: 1024,
          metric: metricItems['modelarts_pool_disk.available_capacity'].key, // 报警指标
        },
        // 磁盘容量
        {
          name: 'capacity',
          label: this.$t('compute.modelarts.monitor.disk.capacity'),
          seleteItem: 'available_capacity',
          fromItem: 'modelarts_pool_disk',
          unit: 'G',
          transfer: 1024,
          metric: metricItems['modelarts_pool_disk.capacity'].key, // 报警指标
        },
        // 磁盘使用率
        {
          name: 'disk',
          label: this.$t('compute.text_533'),
          seleteItem: 'usage_percent',
          fromItem: 'modelarts_pool_disk',
          unit: '%',
          transfer: 1,
          metric: metricItems['modelarts_pool_disk.usage_percent'].key, // 报警指标
        },
      ],
    }
  },
  computed: {
    isCpu () {
      return this.data.instance_type.includes(ARCH_MAP.CPU.key.toLowerCase())
    },
    isGpu () {
      return this.data.instance_type.includes(ARCH_MAP.GPU.key.toLowerCase())
    },
    isArm () {
      return this.data.cpu_arch === SPEC_MAP.arm64.key
    },
    cMonitorConstants () {
      let arch = ARCH_MAP.CPU.key
      if (this.isGpu) {
        arch = ARCH_MAP.GPU.key
      } else if (this.isArm) {
        arch = ARCH_MAP.Ascend.key
      }
      return this.monitorConstants.filter(item => !item.arch || item.arch.includes(arch))
    },
  },
}
</script>

<style>

</style>
