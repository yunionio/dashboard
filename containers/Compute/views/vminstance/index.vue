<template>
  <div>
    <page-header title="主机" />
    <page-body>
      <vm-instance-list />
    </page-body>
  </div>
</template>

<script>
import VmInstanceList from './components/List'

export default {
  name: 'VmInstanceIndex',
  components: {
    VmInstanceList,
  },
  methods: {
    createServer () {
      this.$router.push('/vminstance/create')
    },
  },
}
</script>
