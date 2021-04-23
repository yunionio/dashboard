<template>
  <ssh-proxy-match-list
      :id="id"
      :proxyEndpointId="resId"
      :getParams="getParams" />
</template>

<script>
import SshProxyMatchList from '@Network/views/ssh-proxy-match/components/List'

export default {
  name: 'SshProxyScopeSidePage',
  components: {
    SshProxyMatchList,
  },
  props: {
    id: String,
    resId: String,
    getParams: [Function, Object],
  },
}
</script>
