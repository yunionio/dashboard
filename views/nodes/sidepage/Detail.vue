<template>
  <div>
    <a-row class="mb-2" :gutter="{ lg: 24, xl: 12, xxl: 24 }">
      <a-col class="mb-3" :lg="12" :xl="6">
        <progress-card :progress="cpu" />
      </a-col>
      <a-col class="mb-3" :lg="12" :xl="6">
        <progress-card :progress="memory" />
      </a-col>
      <a-col class="mb-3" :lg="12" :xl="6">
        <progress-card :progress="pod" />
      </a-col>
    </a-row>
    <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="k8s_nodes"
    :nameProps="{edit: false}" />
  </div>

</template>

<script>
import { operatingSystemColumn, annotateColumn, tagColumn, taintColumn } from '@K8S/utils/sidePageColumn'
import ProgressCard from '@/sections/ProgressCard'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'

export default {
  name: 'K8SNodeDetail',
  components: {
    ProgressCard,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      cpu: {
        title: 'CPU(核)',
        percent: this.data.allocatedResources.cpuRequests / this.data.allocatedResources.cpuCapacity || 0,
        msg: {
          current: (this.data.allocatedResources.cpuRequests / 1000),
          currentLabel: '已分配',
          total: (this.data.allocatedResources.cpuCapacity / 1000),
        },
      },
      memory: {
        title: '内存',
        percent: this.data.allocatedResources.memoryRequests / this.data.allocatedResources.memoryCapacity || 0,
        msg: {
          current: sizestr(this.data.allocatedResources.memoryRequests, 'B', 1024),
          currentLabel: '已分配',
          total: sizestr(this.data.allocatedResources.memoryCapacity, 'B', 1024),
        },
      },
      pod: {
        title: '容器组',
        percent: this.data.allocatedResources.allocatedPods / this.data.allocatedResources.podCapacity || 0,
        msg: {
          current: this.data.allocatedResources.allocatedPods,
          currentLabel: '已分配',
          total: this.data.allocatedResources.podCapacity,
        },
      },
      baseInfo: [
        getCopyWithContentTableColumn({ field: 'cluster', title: '集群' }),
        {
          field: 'unschedulable',
          title: '可调度',
          formatter: ({ cellValue }) => {
            return !cellValue ? '可调度' : '不可调度'
          },
        },
      ],
      statusColumns: [
        {
          field: 'type',
          title: 'Type',
          minWidth: 100,
          showOverflow: 'ellipsis',
        },
        {
          field: 'status',
          title: 'Status',
          width: 75,
        },
        {
          field: 'lastTransitionTime',
          title: 'LastTransitionTime',
          minWidth: 100,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format('YYYY年MM月DD日 HH:mm:ss')
          },
        },
        {
          field: 'reason',
          title: 'Reason',
          minWidth: 70,
          showOverflow: 'ellipsis',
        },
        {
          field: 'message',
          title: 'Message',
          minWidth: 70,
          showOverflow: 'ellipsis',
        },
      ],
      extraInfo: [
        operatingSystemColumn(),
        annotateColumn(),
        tagColumn(),
        taintColumn(),
      ],
    }
  },
}
</script>
