<template>
  <div>
    <page-header :title="$t('aice.aiproxy.virtual_key')" />
    <page-body><list :id="listId" /></page-body>
  </div>
</template>

<script>
import List from './components/List'
export default {
  name: 'AiVirtualKeyIndex',
  components: { List },
  data () { return { listId: 'AiVirtualKeyList' } },
}
</script>
