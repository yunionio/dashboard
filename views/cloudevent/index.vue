<template>
  <div>
    <page-header :title="$t('dictionary.cloudevents')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'CloudeventsIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'CloudeventsList',
    }
  },
}
</script>
