<template>
  <div>
   <page-header title="$t('network.text_316')" />
   <page-body>
     <list :id="listId" />
   </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'DnsZonecacheIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'DnsZonecacheList',
    }
  },
}
</script>
