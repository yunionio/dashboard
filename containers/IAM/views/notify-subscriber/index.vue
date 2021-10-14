<template>
  <div>
    <page-header :title="$t('system.notify.topic.receiver.management')" />
    <page-body>
      <notify-subscriber-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import NotifySubscriberList from './components/List'

export default {
  name: 'NotifySubscriberIndex',
  components: {
    NotifySubscriberList,
  },
  data () {
    return {
      listId: 'NotifySubscriberList',
    }
  },
}
</script>
