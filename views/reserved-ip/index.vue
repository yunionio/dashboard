<template>
  <div>
   <page-header :title="$t('network.text_651')" />
   <page-body>
     <reserved-ip-list :id="listId" />
   </page-body>
  </div>
</template>

<script>
import ReservedIpList from './components/List'

export default {
  name: 'ReservedIPIndex',
  components: {
    ReservedIpList,
  },
  data () {
    return {
      listId: 'ReservedIPList',
    }
  },
}
</script>
