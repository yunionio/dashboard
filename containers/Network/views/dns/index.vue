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
  name: 'DnsIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'DnsList',
    }
  },
}
</script>
