<template>
  <div>
    <page-header title="全局VPC" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'GlobalVpcList',
  components: {
    List,
  },
  data () {
    return {
      listId: 'GlobalVpcList',
    }
  },
}
</script>
