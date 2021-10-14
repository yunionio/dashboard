<template>
  <div>
    <page-header :title="$t('dictionary.webconsole')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'NotificationIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'NotificationList',
    }
  },
}
</script>
