<template>
  <div>
    <page-header :title="this.$t('dictionary.nat')" />
    <page-body>
      <nat-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import NatList from './components/List'
export default {
  name: 'NatIndex',
  components: {
    NatList,
  },
  data () {
    return {
      listId: 'NatList',
    }
  },
}
</script>
