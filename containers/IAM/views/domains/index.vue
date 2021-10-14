<template>
  <div>
    <page-header :title="$t('dictionary.domain')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'DomainIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'DomainList',
    }
  },
}
</script>
