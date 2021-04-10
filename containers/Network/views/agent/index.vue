<template>
  <div>
    <page-header :title="$t('network.text_20')" />
    <page-body>
      <list :id="listId" :get-params="getParams" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'AgentIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'AgentList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
