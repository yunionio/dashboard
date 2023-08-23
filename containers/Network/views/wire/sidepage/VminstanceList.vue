<template>
  <vminstance-list
    :hidden-actions="['create']"
    :hiddenFilterOptions="['host']"
    :id="id"
    :getParams="getParams" />
</template>

<script>
import VminstanceList from '@Compute/views/vminstance/components/List'

export default {
  name: 'VminstanceListForWireSidepage',
  components: {
    VminstanceList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
