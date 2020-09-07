<template>
  <div>
   <page-header :title="$t('dictionary.dns_recordset')" />
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
