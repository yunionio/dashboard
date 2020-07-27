<template>
  <div>
    <page-header :title="$t('network.text_19')" />
    <page-body>
      <list :id="listId" :get-params="getParams" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'LoadbalancerclusterIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'LoadbalancerclusterList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
