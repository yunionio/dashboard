<template>
  <div>
    <page-header title="虚拟机" />
    <page-body>
      <vm-instance-list :id="listId" />
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
  data () {
    return {
      listId: 'VMInstanceList',
    }
  },
  methods: {
    createServer () {
      this.$router.push('/vminstance/create')
    },
  },
}
</script>
