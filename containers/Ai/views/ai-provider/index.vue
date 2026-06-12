<template>
  <div>
    <page-header :title="$t('aice.aiproxy.provider')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'AiProviderIndex',
  components: { List },
  data () {
    return { listId: 'AiProviderList' }
  },
}
</script>
