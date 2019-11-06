<template>
  <div>
    <page-header title="实例列表" />
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
