<template>
  <vminstance-list
    :hiddenFilterOptions="['host']"
    :id="id"
    :getParams="getParams" />
</template>

<script>
import VminstanceList from '@Compute/views/vminstance/components/List'

export default {
  name: 'SecgroupListForVminstanceSidepage',
  components: {
    VminstanceList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
