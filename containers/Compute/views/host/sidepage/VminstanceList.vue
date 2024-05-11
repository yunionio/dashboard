<template>
  <component
    :is="vm_list_type"
    :hidden-actions="['create']"
    :hiddenFilterOptions="['host']"
    :id="id"
    :getParams="getParams" />
</template>

<script>
import VminstanceList from '@Compute/views/vminstance/components/List'
import VmContainerInstanceList from '@Compute/views/vminstance-container/components/List'

export default {
  name: 'VminstanceListForHostSidePage',
  components: {
    VminstanceList,
    VmContainerInstanceList,
  },
  props: {
    id: String,
    data: Object,
    getParams: [Function, Object],
  },
  computed: {
    vm_list_type () {
      if (this.data.host_type === 'container') {
        return 'vm-container-instance-list'
      } else {
        return 'vminstance-list'
      }
    },
  },
}
</script>
