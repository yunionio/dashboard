<template>
  <div>
    <page-header :title="$t('aice.aiproxy.api_key')" />
    <page-body><list :id="listId" /></page-body>
  </div>
</template>

<script>
import List from './components/List'
export default {
  name: 'AiKeyIndex',
  components: { List },
  data () { return { listId: 'AiKeyList' } },
}
</script>
