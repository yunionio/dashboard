<template>
  <div>
    <page-header :title="$t('dictionary.tablestore')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'Tablestore',
  components: {
    List,
  },
  data () {
    return {
      listId: 'TablestoreList',
    }
  },
}
</script>
