<template>
  <div>
    <page-header :title="$t('middleware.elasticsearch')" />
    <page-body>
      <elastic-search-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ElasticSearchList from './components/List'

export default {
  name: 'Kafka',
  components: {
    ElasticSearchList,
  },
  data () {
    return {
      listId: 'ElasticSearchList',
    }
  },
}
</script>
