<template>
  <div>
    <page-header title="裸金属" />
    <page-body>
      <baremetal-list />
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
}
</script>
