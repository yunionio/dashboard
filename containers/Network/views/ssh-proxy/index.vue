<template>
  <div>
    <page-header :title="$t('network.ssh-proxy.endpoints')" />
    <page-body>
      <ssh-proxy-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import SshProxyList from './components/List'

export default {
  name: 'SshProxyTableIndex',
  components: {
    SshProxyList,
  },
  data () {
    return {
      listId: 'SshProxyList',
    }
  },
}
</script>
