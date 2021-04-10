<template>
  <div>
    <page-header :title="$t('network.text_143')" />
    <page-body>
      <list :id="listId" :get-params="getParams" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'LbcertIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'LbcertList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
