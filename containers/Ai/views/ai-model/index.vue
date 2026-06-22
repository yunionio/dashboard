<template>
  <div>
    <page-header :title="$t('aice.aiproxy.model')" />
    <page-body><list :id="listId" /></page-body>
  </div>
</template>

<script>
import List from './components/List'
export default {
  name: 'AiModelIndex',
  components: { List },
  data () { return { listId: 'AiModelList' } },
}
</script>
