<template>
  <div>
    <page-header :title="$t('helm.text_5')" />
    <page-body>
      <chart-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ChartList from './components/List'

export default {
  name: 'K8sChartIndex',
  components: {
    ChartList,
  },
  data () {
    return {
      listId: 'K8sChartList',
    }
  },
}
</script>
