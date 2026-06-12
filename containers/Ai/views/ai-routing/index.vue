<template>
  <div>
    <page-header :title="$t('aice.aiproxy.routing')" />
    <page-body><list :id="listId" /></page-body>
  </div>
</template>

<script>
import List from './components/List'
export default {
  name: 'AiRoutingIndex',
  components: { List },
  data () { return { listId: 'AiRoutingList' } },
}
</script>
