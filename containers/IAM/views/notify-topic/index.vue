<template>
  <div>
    <page-header :title="$t('dictionary.notify-topic')" />
    <page-body>
      <notify-topic-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import NotifyTopicList from './components/List'

export default {
  name: 'NotifyTopicIndex',
  components: {
    NotifyTopicList,
  },
  data () {
    return {
      listId: 'NotifyTopicList',
    }
  },
}
</script>
