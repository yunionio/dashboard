<template>
  <div>
   <page-header :title="$t('dictionary.dnszone')" />
   <page-body>
     <list :id="listId" />
   </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'DnsZoneIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'DnsZoneList',
    }
  },
}
</script>
