<template>
  <component
    v-if="serverList"
    :is="serverList.component"
    :key="serverList.key"
    :data="data"
    :gpu-columns="gpuColumns"
    v-bind="serverList.props" />
</template>

<script>
import Server from './Servers'
import VmContainer from './VmContainer'

const SERVER_LISTS = {
  hypervisor: {
    component: 'Server',
    key: 'kvm',
    props: {
      hypervisor: 'kvm',
      sidePage: 'VmInstanceSidePage',
      listId: 'ServersListForGpuSidePage',
    },
  },
  container: {
    component: 'VmContainer',
    key: 'pod',
    props: {},
  },
  baremetal: {
    component: 'Server',
    key: 'baremetal',
    props: {
      hypervisor: 'baremetal',
      sidePage: 'BaremetalSidePage',
      sidePageTab: 'baremetal-detail',
      listId: 'BaremetalServersListForGpuSidePage',
      readonly: true,
    },
  },
}

export default {
  name: 'AssociatedGpusIndex',
  components: {
    Server,
    VmContainer,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    getParams: {
      type: [Function, Object],
    },
    resId: {
      type: String,
      required: true,
    },
    gpuColumns: {
      type: Array,
      required: true,
    },
    hostType: {
      type: String,
      default: '',
    },
  },
  computed: {
    serverList () {
      return SERVER_LISTS[this.hostType] || null
    },
  },
}
</script>
