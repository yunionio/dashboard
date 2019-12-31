<template>
  <div>
    <page-header title="裸金属" />
    <page-body>
      <baremetal-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import BaremetalList from './components/List'

export default {
  name: 'BaremetalIndex',
  components: {
    BaremetalList,
  },
  data () {
    return {
      listId: 'BaremetalList',
    }
  },
}
</script>
