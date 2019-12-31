<template>
  <div>
    <page-header title="弹性公网IP" />
    <page-body>
      <eip-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import EipList from './components/List'

export default {
  name: 'EipIndex',
  components: {
    EipList,
  },
  data () {
    return {
      listId: 'EipList',
    }
  },
}
</script>
