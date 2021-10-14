<template>
  <div>
    <page-header :title="$t('dictionary.group')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'GroupIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'GroupList',
    }
  },
}
</script>
