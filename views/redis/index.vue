<template>
  <div>
    <page-header title="实例列表" />
    <page-body>
      <redis-list :id="listId" />
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
  data () {
    return {
      listId: 'RedisList',
    }
  },
  methods: {
    createServer () {
      this.$router.push('/redis/create')
    },
  },
}
</script>
