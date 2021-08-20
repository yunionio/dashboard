<template>
  <div>
    <page-header :title="this.$t('dictionary.cdn_domain')" />
    <page-body>
      <domain-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import DomainList from './components/List'
export default {
  name: 'DomainIndex',
  components: {
    DomainList,
  },
  data () {
    return {
      listId: 'DomainList',
    }
  },
}
</script>
