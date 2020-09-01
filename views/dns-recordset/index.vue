<template>
  <div>
   <page-header :title="$t('network.text_184')" />
   <page-body>
     <list :id="listId" />
   </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'DnsRecordSetIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'DnsRecordSetList',
    }
  },
}
</script>
