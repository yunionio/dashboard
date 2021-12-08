<template>
  <div>
    <page-header :title="$t('dictionary.vpc_peer_connect')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'VpcPeerConnectIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'VpcPeerConnectList',
    }
  },
}
</script>
