<template>
  <div>
    <page-header :title="$t('dictionary.identity_provider')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'IDPIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'IDPList',
    }
  },
}
</script>
