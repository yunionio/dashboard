<template>
  <div>
    <page-header :title="$t('dictionary.contact')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'ContactIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'ContactList',
    }
  },
}
</script>
