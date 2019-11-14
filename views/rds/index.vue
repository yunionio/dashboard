<template>
  <div>
    <page-header title="实例列表" />
    <page-body>
      <rds-list />
    </page-body>
  </div>
</template>

<script>
import rdsList from './components/List'

export default {
  name: 'VmInstanceIndex',
  components: {
    rdsList,
  },
  methods: {
    createServer () {
      this.$router.push('/rds/create')
    },
  },
}
</script>
