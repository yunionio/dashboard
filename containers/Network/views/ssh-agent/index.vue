<template>
  <div>
    <page-header :title="$t('network.ssh-proxy.proxyservice')" />
    <page-body>
      <ssh-agent-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import SshAgentList from './components/List'

export default {
  name: 'SshAgentTableIndex',
  components: {
    SshAgentList,
  },
  data () {
    return {
      listId: 'SshAgentList',
    }
  },
}
</script>
