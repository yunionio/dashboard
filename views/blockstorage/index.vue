<template>
  <div>
    <page-header title="块存储" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'BlockAtorage',
  components: {
    List,
  },
  data () {
    return {
      listId: 'BlockStorageList',
    }
  },
}
</script>
