<template>
  <div>
    <page-header title="存储桶" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'BucketStorage',
  components: {
    List,
  },
  data () {
    return {
      listId: 'BucketList',
    }
  },
}
</script>
