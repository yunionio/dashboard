
<template>
  <baremetal-list
    :hiddenFilterOptions="['host']"
    :id="id"
    :getParams="getParams" />
</template>

<script>
import BaremetalList from '@Compute/views/baremetal/components/List'

export default {
  name: 'BaremetalListForPhysicalmachineSidepage',
  components: {
    BaremetalList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
