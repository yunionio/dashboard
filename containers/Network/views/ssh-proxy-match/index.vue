<template>
  <div>
    <page-header :title="$t('network.ssh-proxy-match.title')" />
    <page-body>
      <ssh-proxy-match-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import SshProxyMatchList from './components/List'

export default {
  name: 'SshProxyMatchTableIndex',
  components: {
    SshProxyMatchList,
  },
  data () {
    return {
      listId: 'SshProxyMatchList',
    }
  },
}
</script>
