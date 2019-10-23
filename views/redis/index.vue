<template>
  <div>
    <page-header title="Redis" />
    <page-body>
      <redis-list />
    </page-body>
  </div>
</template>

<script>
import RedisList from './components/List'

export default {
  name: 'VmInstanceIndex',
  components: {
    RedisList,
  },
  methods: {
    createServer () {
      this.$router.push('/redis/create')
    },
  },
}
</script>
