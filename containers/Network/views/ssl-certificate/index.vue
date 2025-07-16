<template>
  <div>
   <page-header :title="$t('network.ssl_certificate')" />
   <page-body>
     <list
      :id="listId" />
   </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'SslCertificateIndex',
  components: {
    List,
  },
  mixins: [],
  data () {
    return {
      listId: 'SslCertificateList',
    }
  },
}
</script>
