<template>
  <div>
    <page-header :title="$t('dictionary.mongodb')" />
    <page-body>
      <mongodb-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import mongodbList from './components/List'

export default {
  name: 'MongoDBIndex',
  components: {
    mongodbList,
  },
  data () {
    return {
      listId: 'MongoDBList',
    }
  },
}
</script>
