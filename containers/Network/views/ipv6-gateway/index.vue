<template>
  <div>
    <page-header :title="$t('dictionary.ipv6_gateway')" />
    <page-body>
      <list
        :id="listId"
        :get-params="getParams" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'Ipv6GatewayIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'Ipv6GatewayList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
