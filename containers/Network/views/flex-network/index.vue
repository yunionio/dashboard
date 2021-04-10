<template>
  <div>
    <page-header :title="$t('dictionary.networkinterface')" />
    <page-body>
      <flex-network-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import FlexNetworkList from './components/List'

export default {
  name: 'FlexNetworkIndex',
  components: {
    FlexNetworkList,
  },
  data () {
    return {
      listId: 'FlexNetworkList',
    }
  },
}
</script>
