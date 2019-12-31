<template>
  <div>
    <page-header title="弹性网卡" />
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
