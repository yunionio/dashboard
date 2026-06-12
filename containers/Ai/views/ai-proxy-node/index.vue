<template>
  <div>
    <page-header :title="$t('aice.aiproxy.proxy_node')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'AiProxyNodeIndex',
  components: { List },
  data () {
    return {
      listId: 'AiProxyNodeList',
    }
  },
}
</script>
