<template>
  <div>
    <page-header :title="$t('compute.text_112')" />
    <page-body>
      <physicalmachine-list :getParams="getParams" :id="listId" />
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
      listId: 'PhysicalmachineList',
      getParams: {
        details: true,
        baremetal: true,
        host_type: 'baremetal',
      },
    }
  },
}
</script>
