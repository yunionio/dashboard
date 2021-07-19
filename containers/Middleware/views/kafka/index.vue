<template>
  <div>
    <page-header :title="$t('middleware.kafka')" />
    <page-body>
      <kafka-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import KafkaList from './components/List'

export default {
  name: 'Kafka',
  components: {
    KafkaList,
  },
  data () {
    return {
      listId: 'KafkaList',
    }
  },
}
</script>
