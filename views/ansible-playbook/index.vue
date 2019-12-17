<template>
  <div>
    <page-header title="任务" />
    <page-body>
      <list :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'BaremetalIndex',
  components: {
    List,
  },
  methods: {
    getParams () {
      return {
        details: true,
      }
    },
  },
}
</script>
