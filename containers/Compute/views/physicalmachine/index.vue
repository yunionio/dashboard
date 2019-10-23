<template>
  <div>
    <page-header title="物理机" />
    <page-body>
      <physicalmachine-list :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import PhysicalmachineList from './components/List'

export default {
  name: 'PhysicalmachineIndex',
  components: {
    PhysicalmachineList,
  },
  data () {
    return {
      getParams: {
        details: true,
        baremetal: true,
        host_type: 'baremetal',
      },
    }
  },
}
</script>
