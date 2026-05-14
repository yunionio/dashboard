<template>
  <div>
    <page-header :title="$t('aice.llm_deployment')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'LlmDeploymentIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'LlmDeploymentList',
    }
  },
}
</script>
