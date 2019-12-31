<template>
  <div>
    <page-header title="IP子网" />
    <page-body>
      <network-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import NetworkList from './components/List'

export default {
  name: 'NetworkIndex',
  components: {
    NetworkList,
  },
  data () {
    return {
      listId: 'NetworkList',
    }
  },
}
</script>
