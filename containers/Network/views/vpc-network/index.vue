<template>
  <div>
    <page-header :title="$t('dictionary.vpc_network')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'VpcNetworkIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'VpcNetworkList',
    }
  },
}
</script>
