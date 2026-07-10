<template>
  <div>
    <page-header :title="$t('aice.llm_benchmark')" />
    <page-body><list :id="listId" /></page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'LlmBenchmarkIndex',
  components: { List },
  data () {
    return {
      listId: 'LlmBenchmarkList',
    }
  },
}
</script>
