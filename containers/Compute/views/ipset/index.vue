<template>
  <div>
    <page-header :title="$t('compute.title.ipset')" />
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
  name: 'IpSetIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'IpSetList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
